import { createServer, Server } from 'node:http'
import { AddressInfo } from 'node:net'
import {
  createShopSavvyClient,
  APIError,
  AuthenticationError,
  CreditsExhaustedError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from '../src/index'

type Reply = { status: number; headers?: Record<string, string>; body: unknown }

// A real HTTP server on localhost; the real client and the real global fetch talk to it.
let server: Server
let baseUrl: string
let next: Reply

beforeAll(async () => {
  server = createServer((_req, res) => {
    res.writeHead(next.status, { 'Content-Type': 'application/json', ...(next.headers || {}) })
    res.end(typeof next.body === 'string' ? next.body : JSON.stringify(next.body))
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

const api = () => createShopSavvyClient({ apiKey: 'ss_test_fixture0123456789', baseUrl })

function errorBody(code: string, error: string, requestId = 'req_123') {
  return {
    success: false,
    error,
    error_detail: {
      code,
      message: error,
      action: 'Do the thing',
      docs_url: `https://shopsavvy.com/data/documentation/errors#${code.toLowerCase()}`,
    },
    meta: { request_id: requestId },
  }
}

async function caught(): Promise<any> {
  try {
    await api().getProductDetails('611247373064')
  } catch (e) {
    return e
  }
  throw new Error('expected the call to throw')
}

describe('typed API errors', () => {
  it('ERR_RATE_LIMIT is a RateLimitError with retryAfterSeconds from Retry-After', async () => {
    next = { status: 429, headers: { 'Retry-After': '7' }, body: errorBody('ERR_RATE_LIMIT', 'Rate limit exceeded') }
    const e = await caught()
    expect(e).toBeInstanceOf(RateLimitError)
    expect(e).toBeInstanceOf(APIError)
    expect(e).toBeInstanceOf(Error)
    expect(e).not.toBeInstanceOf(CreditsExhaustedError)
    expect(e.message).toBe('Rate limit exceeded')
    expect(e.statusCode).toBe(429)
    expect(e.code).toBe('ERR_RATE_LIMIT')
    expect(e.action).toBe('Do the thing')
    expect(e.docsUrl).toBe('https://shopsavvy.com/data/documentation/errors#err_rate_limit')
    expect(e.requestId).toBe('req_123')
    expect(e.retryAfterSeconds).toBe(7)
  })

  it('ERR_CREDITS_EXHAUSTED is a CreditsExhaustedError and not a RateLimitError', async () => {
    next = { status: 429, body: errorBody('ERR_CREDITS_EXHAUSTED', 'Credits exhausted') }
    const e = await caught()
    expect(e).toBeInstanceOf(CreditsExhaustedError)
    expect(e).toBeInstanceOf(APIError)
    expect(e).not.toBeInstanceOf(RateLimitError)
    expect(e.code).toBe('ERR_CREDITS_EXHAUSTED')
    expect(e.retryAfterSeconds).toBeNull()
  })

  it('a 429 without error_detail (older server) stays a RateLimitError with null code', async () => {
    next = { status: 429, headers: { 'Retry-After': '3' }, body: { success: false, error: 'Too many requests' } }
    const e = await caught()
    expect(e).toBeInstanceOf(RateLimitError)
    expect(e.message).toBe('Too many requests')
    expect(e.code).toBeNull()
    expect(e.action).toBeNull()
    expect(e.docsUrl).toBeNull()
    expect(e.requestId).toBeNull()
    expect(e.retryAfterSeconds).toBe(3)
  })

  it('maps 401, 404 and 400 to their classes', async () => {
    next = { status: 401, body: errorBody('ERR_AUTH_INVALID', 'Invalid API key') }
    expect(await caught()).toBeInstanceOf(AuthenticationError)
    next = { status: 404, body: errorBody('ERR_PRODUCT_NOT_FOUND', 'Product not found') }
    expect(await caught()).toBeInstanceOf(NotFoundError)
    next = { status: 400, body: errorBody('ERR_INVALID_PARAMS', 'Bad ids') }
    expect(await caught()).toBeInstanceOf(ValidationError)
  })

  it('other codes are a plain APIError carrying the detail', async () => {
    next = { status: 403, body: errorBody('ERR_SUBSCRIPTION_REQUIRED', 'Subscription required') }
    const e = await caught()
    expect(e.constructor).toBe(APIError)
    expect(e.code).toBe('ERR_SUBSCRIPTION_REQUIRED')
    expect(e.statusCode).toBe(403)
  })

  it('a non-JSON error body still throws a typed error with the HTTP status text', async () => {
    next = { status: 502, body: '<html>bad gateway</html>' }
    const e = await caught()
    expect(e).toBeInstanceOf(APIError)
    expect(e.statusCode).toBe(502)
    expect(e.code).toBeNull()
    expect(e.message).toMatch(/^HTTP 502/)
  })
})

// Costs nothing: a well-formed but nonexistent key is rejected before any credit is touched.
describe('live API (no credits used)', () => {
  it('a bogus ss_live_ key gets ERR_AUTH_REVOKED with code and docsUrl', async () => {
    const live = createShopSavvyClient({ apiKey: 'ss_live_' + 'a'.repeat(32) })
    let e: any
    try {
      await live.getProductDetails('611247373064')
    } catch (err) {
      e = err
    }
    expect(e).toBeInstanceOf(AuthenticationError)
    expect(e.code).toBe('ERR_AUTH_REVOKED')
    expect(e.docsUrl).toContain('https://shopsavvy.com/data/documentation/errors')
    expect(e.statusCode).toBe(401)
  })
})
