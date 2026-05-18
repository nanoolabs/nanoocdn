export async function getCacheResponse(request) {
  // Construct a cache key that is stable but accounts for range requests
  // We use the original URL and the Range header as the key.
  const cacheKey = new Request(request.url, {
    headers: request.headers,
    method: 'GET', // Always cache as GET even if request is HEAD
  })
  return await caches.default.match(cacheKey)
}

export async function saveToCache(request, response, ctx) {
  // Cache the response if it's successful (200 or 206)
  if (!response.ok) return

  const cacheKey = new Request(request.url, {
    headers: request.headers,
    method: 'GET',
  })

  // We clone the response to store it in cache without consuming the original body
  // IMPORTANT: We must create a new Response object to modify headers.
  // Responses from fetch() have immutable headers. Simply cloning doesn't work.
  const cacheResponse = response.clone()
  const mutableResponse = new Response(cacheResponse.body, cacheResponse)

  // We add a Cache-Control header if B2 doesn't provide one, or to override it
  // s-maxage=3600 tells Cloudflare to cache it for 1 hour at the edge
  mutableResponse.headers.set('Cache-Control', 'public, s-maxage=3600')

  // Use ctx.waitUntil so the response is sent to the user immediately,
  // while the cache write happens in the background.
  ctx.waitUntil(caches.default.put(cacheKey, mutableResponse))
}
