//
// Proxy Backblaze S3 compatible API requests, sending notifications to a webhook
//
// Adapted from https://github.com/obezuk/worker-signed-s3-template
//
import {
  sanitizePath,
  isListBucketRequest,
  createHeadResponse,
} from './lib/utils.js'
import { signRequest, getUpstreamHostname } from './lib/signer.js'
import { getCacheResponse, saveToCache } from './lib/cache.js'
import { homePage, errorPage } from './lib/home.js'

// How many times to retry a range request where the response is missing content-range
const RANGE_RETRY_ATTEMPTS = 3

/**
 * Strips sensitive B2/S3 header from the response to mask the origin eco
 * @param {Response} response
 * @returns {Headers}
 */
function cleanHeaders(response) {
  const headers = new Headers(response.headers)
  const headersToRemove = [
    'x-amz-request-id',
    'x-amz-id-2',
    'x-bz-content-sha1',
    'x-bz-upload-timestamp',
    'x-bz-upload-url',
    'x-bz-info-author',
    'Server',
  ]
  headersToRemove.forEach((h) => headers.delete(h))
  return headers
}

// Supress IntelliJ's "unused default export" warning
// noinspection JSUnusedGlobalSymbols
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = sanitizePath(url.pathname)

    // 1. Parse allowed origins
    const allowedOrigins = (env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
    const isWildcard = allowedOrigins.includes('*')

    // 2. Determine if request is allow (origin or referer check)
    const origin = request.headers.get('Origin')
    const referer = request.headers.get('Referer')
    let refererOrigin = null
    try {
      refererOrigin = referer ? new URL(referer).origin : null
    } catch (e) {
      // Ignore invalid referer URL
    }

    const isAllowed =
      isWildcard ||
      (origin && allowedOrigins.includes(origin)) ||
      (refererOrigin && allowedOrigins.includes(refererOrigin)) ||
      (!origin && !referer) // Allow direct access

    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': isAllowed
            ? origin || '*'
            : allowedOrigins[0] || '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Range',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // Serve home page for root path
    if (path === '' || path === '/') {
      return new Response(homePage, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      })
    }

    // Block unauthorized origins/referers
    if (!isAllowed) {
      console.error(
        '[CORS] Unauthorized access attempt from:',
        origin || refererOrigin || 'unknown'
      )
      return new Response(errorPage, {
        status: 403,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      })
    }

    // Only allow GET and HEAD methods
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response(null, {
        status: 405,
        statusText: 'Method Not Allowed',
      })
    }

    // Edge Caching: Check if we have a HIT before doing any heavy lifting.
    const cachedResponse = await getCacheResponse(request)
    if (cachedResponse) {
      console.log('[CACHE] HIT:', new URL(request.url).pathname)
      const cleanedCachedHeaders = cleanHeaders(cachedResponse)
      const cleanCachedResponse = new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: cleanedCachedHeaders,
      })

      // Original request was HEAD, so return a new Response without a body
      return request.method === 'HEAD'
        ? createHeadResponse(cleanCachedResponse)
        : cleanCachedResponse
    }
    console.log('[CACHE] MISS:', new URL(request.url).pathname)

    // Reject list bucket requests unless configuration allows it
    if (
      isListBucketRequest(env, path) &&
      String(env['ALLOW_LIST_BUCKET']) !== 'true'
    ) {
      return new Response(null, {
        status: 404,
        statusText: 'Not Found',
      })
    }

    // Set upstream target hostname.
    url.hostname = getUpstreamHostname(env, url.hostname)

    // Set RCLONE_DOWNLOAD to "true" to use rclone with --b2-download-url
    // See https://rclone.org/b2/#b2-download-url
    const rcloneDownload = String(env['RCLONE_DOWNLOAD']) === 'true'
    if (rcloneDownload) {
      if (env['BUCKET_NAME'] === '$path') {
        // Remove leading file/ prefix from the path
        url.pathname = path.replace(/^file\//, '')
      } else {
        // Remove leading file/{bucket_name}/ prefix from the path
        url.pathname = path.replace(/^file\/[^/]+\//, '')
      }
    }

    // Sign the outgoing request
    console.log('[SIGN] Requesting:', url.toString())
    const signedRequest = await signRequest(request, env, url)
    console.log('[SIGN] Success')

    // Save the request method, so we can process responses for HEAD requests appropriately
    const requestMethod = request.method

    // For large files, Cloudflare will return the entire file, rather than the requested range
    // So, if there is a range header in the request, check that the response contains the
    // content-range header. If not, abort the request and try again.
    // See https://community.cloudflare.com/t/cloudflare-worker-fetch-ignores-byte-request-range-on-initial-request/395047/4
    let response
    if (signedRequest.headers.has('range')) {
      console.log('[B2] Fetching range request...')
      let attempts = RANGE_RETRY_ATTEMPTS
      do {
        const controller = new AbortController()
        response = await fetch(signedRequest.url, {
          method: signedRequest.method,
          headers: signedRequest.headers,
          signal: controller.signal,
        })
        console.log('[B2] Range response status:', response.status)
        if (response.headers.has('content-range')) {
          // Only log if it didn't work first time
          if (attempts < RANGE_RETRY_ATTEMPTS) {
            console.log(
              `[B2] Retry for ${signedRequest.url} succeeded - response has content-range header`
            )
          }
          break
        } else if (response.ok) {
          attempts -= 1
          console.error(
            `[B2] Range header in request for ${signedRequest.url} but no content-range header in response. Will retry ${attempts} more times`
          )
          // Do not abort on the last attempt, as we want to return the response
          if (attempts > 0) {
            controller.abort()
          }
        } else {
          // Response is not ok, so don't retry
          break
        }
      } while (attempts > 0)

      if (attempts <= 0) {
        console.error(
          `[B2] Tried range request for ${signedRequest.url} ${RANGE_RETRY_ATTEMPTS} times, but no content-range in response.`
        )
      }
    } else {
      console.log('[B2] Fetching full request...')
      // Send the signed request to B2
      response = await fetch(signedRequest)
      console.log('[B2] Full response status:', response.status)
    }

    // Cache the response if it's successful (200 or 206)
    if (response.ok) {
      // Set cache header base on file extension
      const extension = path.split('.').pop().toLowerCase()
      const staticExtension = [
        // Fonts
        'woff2',
        'woff',
        'ttf',
        'otf',
        // Images
        'png',
        'jpg',
        'jpeg',
        'svg',
        'webp',
        'ico',
        'avif',
        // Scripts, Styles & Runtimes
        'css',
        'js',
        'mjs',
        'map',
        'wasm',
        'astro',
        // Documents
        'pdf',
        'json',
        'xml',
        'txt',
        // Archives & Binaries
        'zip',
        'gz',
        'br',
        'tar',
        'apk',
        'exe',
        'AppImage',
        'dmg',
        // Media
        'mp4',
        'webm',
        'mp3',
        'wav',
        'flac',
        'ogg',
        'mpd',
        'm3u8',
      ]

      // Clone response to modify header
      response = new Response(response.body, response)

      if (staticExtension.includes(extension)) {
        response.headers.set(
          'Cache-Control',
          'public, max-age=31536000, immutable'
        )
      } else {
        response.headers.set(
          'Cache-Control',
          'public, max-age=3600, must-revalidate'
        )
      }

      console.log('[CACHE] Saving...')
      await saveToCache(request, response, ctx)
      console.log('[CACHE] Success')
    } else {
      // Unified 404: If response is not ok (403, 404, 500), return custom 404 page
      return new Response(errorPage, {
        status: 404,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      })
    }

    const finalHeaders = cleanHeaders(response)

    if (requestMethod === 'HEAD') {
      // Original request was HEAD, so return a new Response without a body
      return createHeadResponse(
        new Response(null, { headers: finalHeaders, status: response.status })
      )
    }

    // Return whatever response we have rather than an error response
    const finalResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: finalHeaders,
    })

    if (isAllowed && origin) {
      finalResponse.headers.set('Access-Control-Allow-Origin', origin)
    } else if (isAllowed && isWildcard) {
      finalResponse.headers.set('Access-Control-Allow-Origin', '*')
    }

    return finalResponse
  },
}
