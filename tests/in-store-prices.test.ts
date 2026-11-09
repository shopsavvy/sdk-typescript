import fixture from './fixture-offers-in-store-response.json'
import { createShopSavvyClient, InStorePrice } from '../src/index'

// Only the transport is faked: the response goes through the real client.
function mockFetchWith(body: unknown) {
  const fetchMock = jest.fn(async (_url: string, _init?: RequestInit) => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => JSON.parse(JSON.stringify(body)),
  }))
  global.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

describe('getCurrentOffers in_store_prices', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })
  const api = () => createShopSavvyClient({ apiKey: 'ss_test_fixture0123456789', baseUrl: 'https://api.example.test/v1' })

  it('parses user-collected in-store prices next to the offers', async () => {
    mockFetchWith(fixture)
    const result = await api().getCurrentOffers('011110838360')
    const inStore: InStorePrice = result.data[0].in_store_prices[0]
    expect(inStore.source).toBe('user-collected')
    expect(inStore.retailer).toBe('Kroger')
    expect(inStore.store.address).toBe('1014 Vine St, Cincinnati, OH 45202, USA')
    expect(inStore.store.latitude).toBe(39.1086)
    expect(inStore.price).toBe(3.49)
    expect(inStore.observed_on).toBe('2026-11-07')
    expect(result.data[0].offers[0].retailer).toBe('Walmart')
  })

  it('is an empty array when the server sends none', async () => {
    const body = JSON.parse(JSON.stringify(fixture))
    delete body.data[0].in_store_prices
    mockFetchWith(body)
    const result = await api().getCurrentOffers('011110838360')
    expect(result.data[0].in_store_prices).toEqual([])
  })
})
