const UNSIGNABLE_HEADERS = [
  // These headers appear in the request, but are never passed upstream
  'x-forwarded-proto',
  'x-real-ip',
  // We can't include accept-encoding in the signature because Cloudflare
  // sets the incoming accept-encoding header to "gzip, br", then modifies
  // the outgoing request to set accept-encoding to "gzip".
  // Not cool, Cloudflare!
  'accept-encoding',
  // Conditional headers are not consistently passed upstream
  'if-match',
  'if-modified-since',
  'if-none-match',
  'if-range',
  'if-unmodified-since',
]

// Filter out cf-* and any other headers we don't want to include in the signature
export function filterHeaders(headers, env) {
  // Suppress irrelevant IntelliJ warning
  // noinspection JSCheckFunctionSignatures
  return new Headers(
    Array.from(headers.entries()).filter(
      (pair) =>
        !(
          UNSIGNABLE_HEADERS.includes(pair[0]) ||
          pair[0].startsWith('cf-') ||
          ('ALLOWED_HEADERS' in env &&
            !env['ALLOWED_HEADERS'].includes(pair[0]))
        ),
    ),
  )
}

export function createHeadResponse(response) {
  return new Response(null, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  })
}

export function isListBucketRequest(env, path) {
  const pathSegments = path.split('/')

  return (
    (env['BUCKET_NAME'] === '$path' && pathSegments.length < 2) || // https://endpoint/bucket-name/
    (env['BUCKET_NAME'] !== '$path' && path.length === 0)
  ) // https://bucket-name.endpoint/ or https://endpoint/
}

export function sanitizePath(pathname) {
  // Remove leading slashes from path
  let path = pathname.replace(/^\/+/, '')
  // Remove trailing slashes
  path = path.replace(/\/+$/, '')
  return path
}
