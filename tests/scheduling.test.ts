import { createShopSavvyClient } from '../src/index'

// Only the transport is faked; the real client builds the method, path and query string.
function mockFetch() {
  const fetchMock = jest.fn(async (_url: string, _init?: RequestInit) => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ success: true, data: [], meta: { credits_used: 1, credits_remaining: 999 } }),
  }))
  global.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

function lastCall(fetchMock: ReturnType<typeof mockFetch>) {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1]
  const parsed = new URL(url)
  return { method: init?.method, path: parsed.pathname, query: parsed.searchParams, rawQuery: parsed.search, body: init?.body }
}

// The API's schedule/unschedule handlers read only the query string; a JSON body is ignored.
describe('scheduling sends query params, not a JSON body', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })
  const api = () => createShopSavvyClient({ apiKey: 'ss_test_fixture0123456789', baseUrl: 'https://api.example.test/v1' })

  it('scheduleProductMonitoring: PUT /products/scheduled?ids=&schedule=', async () => {
    const f = mockFetch()
    await api().scheduleProductMonitoring('611247373064', 'daily')
    const c = lastCall(f)
    expect(c.method).toBe('PUT')
    expect(c.path).toBe('/v1/products/scheduled')
    expect(c.query.get('ids')).toBe('611247373064')
    expect(c.query.get('schedule')).toBe('daily')
    expect(c.query.has('retailer')).toBe(false)
    expect(c.body).toBeUndefined()
  })

  it('scheduleProductMonitoring with retailer', async () => {
    const f = mockFetch()
    await api().scheduleProductMonitoring('B07G14HTBZ', 'hourly', { retailer: 'amazon.com' })
    const c = lastCall(f)
    expect(c.method).toBe('PUT')
    expect(c.path).toBe('/v1/products/scheduled')
    expect(c.rawQuery).toBe('?ids=B07G14HTBZ&schedule=hourly&retailer=amazon.com')
    expect(c.body).toBeUndefined()
  })

  it('scheduleProductMonitoringBatch joins ids with commas (URL-encoded)', async () => {
    const f = mockFetch()
    await api().scheduleProductMonitoringBatch(['611247373064', 'B07G14HTBZ', 'iPhone 15 Pro'], 'weekly')
    const c = lastCall(f)
    expect(c.method).toBe('PUT')
    expect(c.path).toBe('/v1/products/scheduled')
    expect(c.query.get('ids')).toBe('611247373064,B07G14HTBZ,iPhone 15 Pro')
    expect(c.rawQuery).toBe('?ids=611247373064%2CB07G14HTBZ%2CiPhone+15+Pro&schedule=weekly')
    expect(c.body).toBeUndefined()
  })

  it('scheduleProductMonitoringBatch with retailer', async () => {
    const f = mockFetch()
    await api().scheduleProductMonitoringBatch(['611247373064', 'B07G14HTBZ'], 'daily', { retailer: 'bestbuy.com' })
    const c = lastCall(f)
    expect(c.method).toBe('PUT')
    expect(c.query.get('ids')).toBe('611247373064,B07G14HTBZ')
    expect(c.query.get('schedule')).toBe('daily')
    expect(c.query.get('retailer')).toBe('bestbuy.com')
    expect(c.body).toBeUndefined()
  })

  it('removeProductFromSchedule: DELETE /products/scheduled?ids=', async () => {
    const f = mockFetch()
    await api().removeProductFromSchedule('611247373064')
    const c = lastCall(f)
    expect(c.method).toBe('DELETE')
    expect(c.path).toBe('/v1/products/scheduled')
    expect(c.rawQuery).toBe('?ids=611247373064')
    expect(c.body).toBeUndefined()
  })

  it('removeProductsFromSchedule joins ids with commas', async () => {
    const f = mockFetch()
    await api().removeProductsFromSchedule(['611247373064', 'B07G14HTBZ'])
    const c = lastCall(f)
    expect(c.method).toBe('DELETE')
    expect(c.path).toBe('/v1/products/scheduled')
    expect(c.query.get('ids')).toBe('611247373064,B07G14HTBZ')
    expect([...c.query.keys()]).toEqual(['ids'])
    expect(c.body).toBeUndefined()
  })

  it('getScheduledProducts: GET /products/scheduled', async () => {
    const f = mockFetch()
    await api().getScheduledProducts()
    const c = lastCall(f)
    expect(c.method).toBeUndefined() // fetch default is GET
    expect(c.path).toBe('/v1/products/scheduled')
  })
})
