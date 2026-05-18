import { AwsClient } from 'aws4fetch'
import { filterHeaders } from './utils.js'

// URL needs colon suffix on protocol, and port as a string
const HTTPS_PROTOCOL = 'https:'
const HTTPS_PORT = '443'

export async function signRequest(request, env, url) {
  // Incoming protocol and port is taken from the worker's environment.
  // Local dev mode uses plain http on 8787, and it's possible to deploy
  // a worker on plain http. B2 only supports https on 443
  url.protocol = HTTPS_PROTOCOL
  url.port = HTTPS_PORT

  // Certain headers, such as x-real-ip, appear in the incoming request but
  // are removed from the outgoing request. If they are in the outgoing
  // signed headers, B2 can't validate the signature.
  const headers = filterHeaders(request.headers, env)

  // Create an S3 API client that can sign the outgoing request
  const client = new AwsClient({
    accessKeyId: env['B2_APPLICATION_KEY_ID'],
    secretAccessKey: env['B2_APPLICATION_KEY'],
    service: 's3',
  })

  // Sign the outgoing request
  //
  // For HEAD requests Cloudflare appears to change the method on the outgoing request to GET (#18), which
  // breaks the signature, resulting in a 403. So, change all HEADs to GETs. This is not too inefficient,
  // since we won't read the body of the response if the original request was a HEAD.
  return await client.sign(url.toString(), {
    method: 'GET',
    headers: headers,
  })
}

export function getUpstreamHostname(env, incomingHostname) {
  // Set upstream target hostname.
  switch (env['BUCKET_NAME']) {
    case '$path':
      // Bucket name is initial segment of URL path
      return env['B2_ENDPOINT']
    case '$host':
      // Bucket name is initial subdomain of the incoming hostname
      return incomingHostname.split('.')[0] + '.' + env['B2_ENDPOINT']
    default:
      // Bucket name is specified in the BUCKET_NAME variable
      return env['BUCKET_NAME'] + '.' + env['B2_ENDPOINT']
  }
}
