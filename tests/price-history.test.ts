import fixture from './fixture-price-history-response.json'
import { createShopSavvyClient, SDK_VERSION, ProductWithOfferHistory } from '../src/index'

// Only the transport is faked: the response goes through the real client
// (request(), alias decoration, history normalization) exactly as in production.
function mockFetchWith(body: unknown, status = 200) {
  const fetchMock = jest.fn(async (_url: string, _init?: RequestInit) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => JSON.parse(JSON.stringify(body)),
  }))
  global.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

describe('getPriceHistory', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  const api = () => createShopSavvyClient({ apiKey: 'ss_test_fixture0123456789', baseUrl: 'https://api.example.test/v1' })

  it('sends ids/start/end (not start_date/end_date) and the optional retailer', async () => {
    const fetchMock = mockFetchWith(fixture)
    await api().getPriceHistory('611247373064', '2022-11-20', '2022-11-27', { retailer: 'amazon.com' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.origin + parsed.pathname).toBe('https://api.example.test/v1/products/offers/history')
    expect(parsed.searchParams.get('ids')).toBe('611247373064')
    expect(parsed.searchParams.get('start')).toBe('2022-11-20')
    expect(parsed.searchParams.get('end')).toBe('2022-11-27')
    expect(parsed.searchParams.get('retailer')).toBe('amazon.com')
    expect(parsed.searchParams.has('start_date')).toBe(false)
    expect(parsed.searchParams.has('end_date')).toBe(false)
    expect((init?.headers as Record<string, string>)['User-Agent']).toBe(`ShopSavvy-TypeScript-SDK/${SDK_VERSION}`)
  })

  it('parses one entry per product, each with offers carrying history', async () => {
    mockFetchWith(fixture)
    const result = await api().getPriceHistory('611247373064,611247369449', '2022-11-20', '2022-11-27')

    expect(result.success).toBe(true)
    expect(result.credits_used).toBe(14)
    expect(result.credits_remaining).toBe(986)
    expect(result.data).toHaveLength(2)

    const [kmini, kelite]: ProductWithOfferHistory[] = result.data

    // Product fields, same as the products endpoint (barcode is a string on the wire).
    expect(kmini.title).toBe('Keurig K-Mini Single Serve Coffee Maker, Black')
    expect(kmini.shopsavvy).toBe('3ONn300xybP3y66ibqc1')
    expect(kmini.barcode).toBe('611247373064')
    expect(kmini.amazon).toBe('B07G14HTBZ')
    expect(kmini.rating).toEqual({ value: 4.6, count: 51234 })
    expect(kmini.name).toBe(kmini.title)
    expect(kmini.asin).toBe('B07G14HTBZ')
    expect(kmini.image_url).toBe(kmini.images?.[0])
    expect(kmini.offers).toHaveLength(2)

    const [amazon, bestbuy] = kmini.offers
    expect(amazon.id).toBe('0IUouCFtZEhxeOablTPl')
    expect(amazon.retailer).toBe('Amazon')
    expect(amazon.price).toBe(74.96)
    expect(amazon.currency).toBe('USD')
    expect(amazon.seller).toBe('ACME Deals')
    expect(amazon.URL).toBe('https://www.amazon.com/dp/B07G14HTBZ?m=A1GKQADQC2VI6E')
    expect(amazon.url).toBe(amazon.URL)
    expect(amazon.offer_id).toBe(amazon.id)
    expect(amazon.last_updated).toBe('2022-11-27T22:36:33.236Z')

    // History: newest first, currency on every point, nullable currency, optional availability.
    expect(amazon.history).toHaveLength(3)
    expect(amazon.history[0]).toEqual({ availability: 'in', price: 74.96, currency: 'USD', timestamp: '2022-11-27T22:36:33.236Z' })
    expect(amazon.history[1].price).toBe(70.99)
    expect(amazon.history[1].availability).toBe('out')
    expect(amazon.history[2].price).toBe(79.99)
    expect(amazon.history[2].currency).toBeNull()
    expect(amazon.history[2].availability).toBeUndefined()
    expect(amazon.history[2].timestamp).toBe('2022-11-21T08:15:00.000Z')

    // First-party offer: seller is an explicit null, availability omitted.
    expect(bestbuy.retailer).toBe('Best Buy')
    expect(bestbuy.seller).toBeNull()
    expect(bestbuy.availability).toBeUndefined()
    expect(bestbuy.history.map(h => h.price)).toEqual([59.99, 64.99])

    // Second product: nullable product fields and an offer with an empty history.
    expect(kelite.shopsavvy).toBe('DrKWneG0MpFlZpwZXNYa')
    expect(kelite.category).toBeNull()
    expect(kelite.amazon).toBeNull()
    expect(kelite.images).toEqual([])
    expect(kelite.image_url).toBeUndefined()
    expect(kelite.offers).toHaveLength(1)
    expect(kelite.offers[0].retailer).toBe('eBay')
    expect(kelite.offers[0].condition).toBe('used')
    expect(kelite.offers[0].history).toEqual([])
  })

  it('normalizes an offer with no history key to an empty array', async () => {
    const body = JSON.parse(JSON.stringify(fixture))
    delete body.data[1].offers[0].history
    mockFetchWith(body)
    const result = await api().getPriceHistory('611247369449', '2022-11-20', '2022-11-27')
    expect(result.data[1].offers[0].history).toEqual([])
  })

  it('surfaces API errors instead of returning partial data', async () => {
    mockFetchWith({ success: false, error: "A 'start' query parameter is required." }, 400)
    await expect(api().getPriceHistory('611247373064', '', '2022-11-27')).rejects.toThrow("A 'start' query parameter is required.")
  })
})
