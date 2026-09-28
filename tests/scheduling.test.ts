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

// Wire shapes from refinery entrypoint-api.ts: `schedule` (PUT) and `scheduled` (GET) return
// publicProductForProduct fields + `schedule` (+ `retailer`); `unschedule` (DELETE) returns
// `{ success, message, meta }` with no `data`.
const SCHEDULE_BODY = {
  success: true,
  data: [
    {
      title: 'Keurig K-Mini Single Serve Coffee Maker, Black',
      category: null,
      brand: 'Keurig',
      color: null,
      shopsavvy: '3ONn300xybP3y66ibqc1',
      barcode: '611247373064',
      amazon: 'B07GV2S1GS',
      model: null,
      mpn: null,
      images: ['https://images.example/k-mini.jpg'],
      rating: { value: 4.6, count: 1200 },
      schedule: 'daily',
      retailer: 'amazon.com',
    },
  ],
  meta: { request_id: 'req-put', credits_used: 1, credits_remaining: 999, rate_limit_remaining: 998 },
}

const UNSCHEDULE_BODY = {
  success: true,
  message: 'Products successfully removed from schedule',
  meta: { request_id: 'req-del', credits_used: 0, credits_remaining: 0, rate_limit_remaining: 0 },
}

const LIST_BODY = {
  success: true,
  data: [
    { ...SCHEDULE_BODY.data[0] },
    {
      title: 'Keurig K-Elite Single Serve K-Cup Pod Maker',
      category: null, brand: null, color: null,
      shopsavvy: 'DrKWneG0MpFlZpwZXNYa',
      barcode: '611247369449', amazon: null, model: null, mpn: null,
      images: [],
      schedule: 'weekly',
    },
    {
      // scheduled at a 4h ShopSavvy Business interval: no Data API label, so `schedule` is omitted
      title: 'Business 4h product',
      category: null, brand: null, color: null,
      shopsavvy: 'bizProduct0000000001',
      barcode: null, amazon: null, model: null, mpn: null,
      images: [],
    },
  ],
  meta: { request_id: 'req-get', credits_used: 0, credits_remaining: 0, rate_limit_remaining: 0 },
}

function mockFetchBody(body: unknown) {
  const fetchMock = jest.fn(async (_url: string, _init?: RequestInit) => ({
    ok: true, status: 200, statusText: 'OK', json: async () => JSON.parse(JSON.stringify(body)),
  }))
  global.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

describe('scheduling parses the real response shapes', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })
  const api = () => createShopSavvyClient({ apiKey: 'ss_test_fixture0123456789', baseUrl: 'https://api.example.test/v1' })

  it('scheduleProductMonitoring returns the scheduled products', async () => {
    mockFetchBody(SCHEDULE_BODY)
    const result = await api().scheduleProductMonitoring('611247373064', 'daily', { retailer: 'amazon.com' })
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    const p = result.data[0]
    expect(p.shopsavvy).toBe('3ONn300xybP3y66ibqc1')
    expect(p.title).toBe('Keurig K-Mini Single Serve Coffee Maker, Black')
    expect(p.barcode).toBe('611247373064')
    expect(p.category).toBeNull()
    expect(p.rating).toEqual({ value: 4.6, count: 1200 })
    expect(p.schedule).toBe('daily')
    expect(p.retailer).toBe('amazon.com')
    expect(p.product_id).toBe('3ONn300xybP3y66ibqc1') // alias getter applied
    expect(result.meta?.request_id).toBe('req-put')
    expect(result.credits_used).toBe(1)
    expect(result.credits_remaining).toBe(999)
  })

  it('scheduleProductMonitoringBatch returns the scheduled products', async () => {
    mockFetchBody(LIST_BODY)
    const result = await api().scheduleProductMonitoringBatch(['611247373064', '611247369449'], 'weekly')
    expect(result.data.map(p => p.shopsavvy)).toEqual(['3ONn300xybP3y66ibqc1', 'DrKWneG0MpFlZpwZXNYa', 'bizProduct0000000001'])
    expect(result.data[1].retailer).toBeUndefined()
  })

  it('removeProductFromSchedule returns success/message/meta and no data', async () => {
    mockFetchBody(UNSCHEDULE_BODY)
    const result = await api().removeProductFromSchedule('611247373064')
    expect(result.success).toBe(true)
    expect(result.message).toBe('Products successfully removed from schedule')
    expect(result.meta?.request_id).toBe('req-del')
    expect(result.credits_used).toBe(0)
    expect('data' in result).toBe(false)
  })

  it('removeProductsFromSchedule returns success/message/meta', async () => {
    mockFetchBody(UNSCHEDULE_BODY)
    const result = await api().removeProductsFromSchedule(['611247373064', '611247369449'])
    expect(result.success).toBe(true)
    expect(result.message).toBe('Products successfully removed from schedule')
  })

  it('getScheduledProducts parses products with optional schedule/retailer', async () => {
    mockFetchBody(LIST_BODY)
    const result = await api().getScheduledProducts()
    expect(result.data).toHaveLength(3)
    const [a, b, c] = result.data
    expect(a.schedule).toBe('daily')
    expect(a.retailer).toBe('amazon.com')
    expect(a.name).toBe('Keurig K-Mini Single Serve Coffee Maker, Black')
    expect(b.schedule).toBe('weekly')
    expect(b.retailer).toBeUndefined()
    expect(b.brand).toBeNull()
    expect(c.schedule).toBeUndefined()
    expect(c.barcode).toBeNull()
    expect(result.meta?.credits_used).toBe(0)
  })
})
