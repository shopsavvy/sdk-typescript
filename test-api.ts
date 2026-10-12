import { createShopSavvyClient } from './src/index'

// Live smoke test against a real API. Never hardcode a key here: this repo is public.
// Usage: SHOPSAVVY_API_KEY=ss_live_... [SHOPSAVVY_BASE_URL=http://localhost:4001/v1] bun run test-api.ts
const apiKey = process.env.SHOPSAVVY_API_KEY
if (!apiKey) {
  console.error('Set SHOPSAVVY_API_KEY to run the live smoke test (get a key at https://shopsavvy.com/data).')
  process.exit(1)
}

const api = createShopSavvyClient({
  apiKey,
  baseUrl: process.env.SHOPSAVVY_BASE_URL || 'https://api.shopsavvy.com/v1'
})

let failures = 0

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`)
    failures++
  } else {
    console.log(`✅ ${message}`)
  }
}

async function test() {
  console.log('=== Testing TypeScript SDK v1.0.2 ===\n')

  // Test 1: Products endpoint
  console.log('--- 1. getProductDetails ---')
  const products = await api.getProductDetails('B0BDHWDR12')
  assert(products.success === true, 'products.success is true')
  assert(typeof products.data[0]?.title === 'string', 'products.data[0].title is string')
  assert(typeof products.data[0]?.shopsavvy === 'string', 'products.data[0].shopsavvy is string')
  assert(products.data[0]?.name === products.data[0]?.title, 'name alias equals title')
  assert(products.data[0]?.product_id === products.data[0]?.shopsavvy, 'product_id alias equals shopsavvy')
  assert(products.data[0]?.asin === products.data[0]?.amazon, 'asin alias equals amazon')
  assert(typeof products.meta?.credits_used === 'number', 'meta.credits_used is number')
  assert(products.credits_used === products.meta?.credits_used, 'credits_used getter works')
  console.log('')

  // Test 2: Offers endpoint
  console.log('--- 2. getCurrentOffers ---')
  const offers = await api.getCurrentOffers('B0BDHWDR12')
  assert(offers.success === true, 'offers.success is true')
  assert(typeof offers.data[0]?.title === 'string', 'offers.data[0].title is string')
  assert(Array.isArray(offers.data[0]?.offers), 'offers.data[0].offers is array')
  if (offers.data[0]?.offers?.length > 0) {
    const offer = offers.data[0].offers[0]
    assert(typeof offer.id === 'string', 'offer.id is string')
    assert(offer.offer_id === offer.id, 'offer_id alias equals id')
  }
  console.log('')

  // Test 3: Usage endpoint
  console.log('--- 3. getUsage ---')
  const usage = await api.getUsage()
  assert(usage.success === true, 'usage.success is true')
  assert(typeof usage.data.current_period === 'object', 'usage.data.current_period is object')
  assert(typeof usage.data.current_period.start_date === 'string', 'current_period.start_date is string')
  assert(typeof usage.data.current_period.credits_used === 'number', 'current_period.credits_used is number')
  assert(usage.data.credits_used === usage.data.current_period.credits_used, 'credits_used alias works')
  console.log('')

  // Test 4: Search endpoint
  console.log('--- 4. searchProducts ---')
  const search = await api.searchProducts('airpods', { limit: 5 })
  assert(search.success === true, 'search.success is true')
  assert(typeof search.pagination?.total === 'number', 'pagination.total is number')
  assert(search.data.length > 0, 'search.data has results')
  assert(typeof search.data[0]?.title === 'string', 'search.data[0].title is string')
  assert(search.data[0]?.name === search.data[0]?.title, 'search result name alias works')
  console.log('')

  // Test 5: Price history endpoint
  //
  // This harness previously exercised products/offers/usage/search but never
  // price history — which is exactly why nobody caught that every SDK sent
  // `start_date`/`end_date` while the endpoint requires `start`/`end`, for over
  // a year, in all 10 languages. A 400 here means the wire params drifted again.
  console.log('--- 5. getPriceHistory ---')
  const historyEnd = new Date()
  const historyStart = new Date(historyEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
  const dateOnly = (d: Date) => d.toISOString().slice(0, 10)
  const history = await api.getPriceHistory(
    'B0BDHWDR12',
    dateOnly(historyStart),
    dateOnly(historyEnd)
  )
  assert(history.success === true, 'history.success is true (a 400 here means start/end drifted again)')
  assert(Array.isArray(history.data), 'history.data is an array')
  assert(typeof history.meta?.credits_used === 'number', 'history meta.credits_used is number')

  // SHAPE assertion, not just a status check. A 200 whose history points are typed under the
  // wrong key is the second, independent way this endpoint was broken in all 10 SDKs: the
  // types declared `price_history[].date`, the API has only ever sent `history[].timestamp`.
  // Statically-typed SDKs returned silent empties (Go/Java/C#/PHP/Ruby) or hard
  // deserialization failures (Rust, Python, Swift, Kotlin) on a perfectly good response.
  const offerWithPoints = history.data.find((offer) => (offer.history?.length ?? 0) > 0)
  assert(offerWithPoints !== undefined, 'at least one returned offer carries history points')
  const point = offerWithPoints?.history?.[0]
  assert(typeof point?.timestamp === 'string', 'history[0].timestamp is a string (NOT `date`)')
  assert(!Number.isNaN(Date.parse(point?.timestamp ?? '')), 'history[0].timestamp parses as a date')
  assert(typeof point?.price === 'number', 'history[0].price is a number')
  console.log('')

  // Summary
  console.log('=================================')
  if (failures === 0) {
    console.log('✅ ALL TESTS PASSED!')
  } else {
    console.log(`❌ ${failures} TEST(S) FAILED`)
    process.exit(1)
  }
}

test().catch(err => {
  console.error('Test error:', err.message)
  process.exit(1)
})
