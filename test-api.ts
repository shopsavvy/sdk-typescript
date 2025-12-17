import { createShopSavvyClient } from './src/index'

const api = createShopSavvyClient({
  apiKey: 'ss_live_9c4ea2e04c5bf64048058359e3eb84a7',
  baseUrl: 'http://localhost:4001/v1'
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
