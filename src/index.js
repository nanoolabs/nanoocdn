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
import { homePage } from './lib/home.js'

// How many times to retry a range request where the response is missing content-range
const RANGE_RETRY_ATTEMPTS = 3

// Supress IntelliJ's "unused default export" warning
// noinspection JSUnusedGlobalSymbols
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = sanitizePath(url.pathname)

    // Serve home page for root path
    if (path === '' || path === '/') {
      return new Response(homePage, {
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
      // Original request was HEAD, so return a new Response without a body
      return request.method === 'HEAD'
        ? createHeadResponse(cachedResponse)
        : cachedResponse
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
              `[B2] Retry for ${signedRequest.url} succeeded - response has content-range header`,
            )
          }
          break
        } else if (response.ok) {
          attempts -= 1
          console.error(
            `[B2] Range header in request for ${signedRequest.url} but no content-range header in response. Will retry ${attempts} more times`,
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
          `[B2] Tried range request for ${signedRequest.url} ${RANGE_RETRY_ATTEMPTS} times, but no content-range in response.`,
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
      console.log('[CACHE] Saving...')
      await saveToCache(request, response, ctx)
      console.log('[CACHE] Success')
    }

    if (requestMethod === 'HEAD') {
      // Original request was HEAD, so return a new Response without a body
      return createHeadResponse(response)
    }

    // Return whatever response we have rather than an error response
    return response
  },
}
