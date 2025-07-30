# ShopSavvy Data API - TypeScript/JavaScript SDK

[![npm version](https://badge.fury.io/js/@shopsavvy/data-api.svg)](https://badge.fury.io/js/@shopsavvy/data-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript SDK for the [ShopSavvy Data API](https://shopsavvy.com/data). Access product data, pricing information, and price history across thousands of retailers and millions of products.

## 🚀 Quick Start

### Installation

```bash
npm install @shopsavvy/data-api
# or
yarn add @shopsavvy/data-api
# or
bun add @shopsavvy/data-api
```

### Get Your API Key

1. Visit [shopsavvy.com/data](https://shopsavvy.com/data)
2. Sign up for an account
3. Choose a subscription plan
4. Get your API key from the dashboard

### Basic Usage

```typescript
import { createShopSavvyClient } from '@shopsavvy/data-api'

// Initialize the client
const api = createShopSavvyClient({
  apiKey: 'ss_live_your_api_key_here'
})

// Look up a product by barcode
const product = await api.getProductDetails('012345678901')
console.log(product.data.name)

// Get current prices from all retailers
const offers = await api.getCurrentOffers('012345678901')
offers.data.forEach(offer => {
  console.log(`${offer.retailer}: $${offer.price}`)
})

// Get price history
const history = await api.getPriceHistory(
  '012345678901',
  '2024-01-01',
  '2024-01-31'
)
```

## 📖 API Reference

### Client Configuration

```typescript
const api = createShopSavvyClient({
  apiKey: 'ss_live_your_api_key_here',
  baseUrl: 'https://api.shopsavvy.com/v1', // optional
  timeout: 30000 // optional, in milliseconds
})
```

### Product Lookup

#### Single Product
```typescript
// Look up by barcode, ASIN, URL, or model number
const product = await api.getProductDetails('012345678901')
const amazonProduct = await api.getProductDetails('B08N5WRWNW')
const urlProduct = await api.getProductDetails('https://www.amazon.com/dp/B08N5WRWNW')
```

#### Multiple Products
```typescript
const products = await api.getProductDetailsBatch([
  '012345678901',
  'B08N5WRWNW',
  'https://www.bestbuy.com/site/product/123456'
])
```

### Current Pricing

#### All Retailers
```typescript
const offers = await api.getCurrentOffers('012345678901')
console.log(`Found ${offers.data.length} offers`)
```

#### Specific Retailer
```typescript
const amazonOffers = await api.getCurrentOffers('012345678901', {
  retailer: 'amazon'
})
```

#### Multiple Products
```typescript
const batchOffers = await api.getCurrentOffersBatch([
  '012345678901',
  'B08N5WRWNW'
])
```

### Price History

```typescript
// Get 30 days of price history
const history = await api.getPriceHistory(
  '012345678901',
  '2024-01-01',
  '2024-01-31'
)

// Get Amazon-specific price history
const amazonHistory = await api.getPriceHistory(
  '012345678901',
  '2024-01-01',
  '2024-01-31',
  { retailer: 'amazon' }
)
```

### Product Monitoring

#### Schedule Monitoring
```typescript
// Monitor daily across all retailers
await api.scheduleProductMonitoring('012345678901', 'daily')

// Monitor hourly at Amazon only
await api.scheduleProductMonitoring('012345678901', 'hourly', {
  retailer: 'amazon'
})

// Schedule multiple products
await api.scheduleProductMonitoringBatch([
  '012345678901',
  'B08N5WRWNW'
], 'daily')
```

#### Manage Scheduled Products
```typescript
// Get all scheduled products
const scheduled = await api.getScheduledProducts()

// Remove from schedule
await api.removeProductFromSchedule('012345678901')

// Remove multiple products
await api.removeProductsFromSchedule(['012345678901', 'B08N5WRWNW'])
```

### Usage Tracking

```typescript
const usage = await api.getUsage()
console.log(`Credits remaining: ${usage.data.credits_remaining}`)
console.log(`Plan: ${usage.data.plan_name}`)
```

## 🔧 Advanced Usage

### Error Handling

```typescript
try {
  const product = await api.getProductDetails('invalid-identifier')
} catch (error) {
  if (error.message.includes('Product not found')) {
    console.log('Product does not exist')
  } else if (error.message.includes('Invalid API key')) {
    console.log('Check your API key')
  } else {
    console.log('Unexpected error:', error.message)
  }
}
```

### Response Format

All API methods return a consistent response format:

```typescript
interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  credits_used?: number
  credits_remaining?: number
}
```

### CSV Format

Some endpoints support CSV format for easier data processing:

```typescript
const product = await api.getProductDetails('012345678901', {
  format: 'csv'
})

const offers = await api.getCurrentOffers('012345678901', {
  format: 'csv'
})
```

### TypeScript Support

The SDK is built with TypeScript and includes full type definitions:

```typescript
import type { 
  ProductDetails, 
  Offer, 
  PriceHistoryEntry,
  UsageInfo 
} from '@shopsavvy/data-api'

const product: ProductDetails = {
  product_id: '12345',
  name: 'Sample Product',
  brand: 'Sample Brand',
  // ... fully typed
}
```

## 💡 Examples

### Price Comparison Tool
```typescript
async function comparePrice(identifier: string) {
  const offers = await api.getCurrentOffers(identifier)
  
  if (offers.data.length === 0) {
    console.log('No offers found')
    return
  }

  const sortedOffers = offers.data.sort((a, b) => a.price - b.price)
  const cheapest = sortedOffers[0]
  const most_expensive = sortedOffers[sortedOffers.length - 1]

  console.log(`Best price: ${cheapest.retailer} - $${cheapest.price}`)
  console.log(`Highest price: ${most_expensive.retailer} - $${most_expensive.price}`)
  console.log(`Savings: $${most_expensive.price - cheapest.price}`)
}
```

### Price Alert System
```typescript
async function setupPriceAlert(identifier: string, targetPrice: number) {
  // Schedule daily monitoring
  await api.scheduleProductMonitoring(identifier, 'daily')
  
  // Check current price
  const offers = await api.getCurrentOffers(identifier)
  const bestOffer = offers.data.sort((a, b) => a.price - b.price)[0]
  
  if (bestOffer.price <= targetPrice) {
    console.log(`🎉 Target price reached! ${bestOffer.retailer}: $${bestOffer.price}`)
  } else {
    console.log(`Current best price: $${bestOffer.price} (target: $${targetPrice})`)
  }
}
```

### Historical Price Analysis
```typescript
async function analyzePriceTrends(identifier: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const history = await api.getPriceHistory(
    identifier,
    thirtyDaysAgo.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  )
  
  for (const offer of history.data) {
    const prices = offer.price_history.map(h => h.price)
    const avgPrice = prices.reduce((a, b) => a + b) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    console.log(`${offer.retailer}:`)
    console.log(`  Average: $${avgPrice.toFixed(2)}`)
    console.log(`  Range: $${minPrice} - $${maxPrice}`)
    console.log(`  Current: $${offer.price}`)
  }
}
```

## 🛠️ Development

### Building from Source

```bash
git clone https://github.com/shopsavvy/typescript-sdk
cd typescript-sdk
npm install
npm run build
```

### Running Tests

```bash
npm test
```

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

## 📚 Additional Resources

- [ShopSavvy Data API Documentation](https://shopsavvy.com/data/documentation)
- [API Dashboard](https://shopsavvy.com/data/dashboard)
- [Support](mailto:business@shopsavvy.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About ShopSavvy

ShopSavvy is a price comparison and shopping app that helps users find the best deals on products across various retailers. Since 2008, ShopSavvy has been downloaded over 40 million times and helps millions of users save money every day.

Our Data API provides the same powerful product data and pricing intelligence that powers our consumer app, available to developers and businesses worldwide.

---

**Need help?** Contact us at [business@shopsavvy.com](mailto:business@shopsavvy.com) or visit [shopsavvy.com/data](https://shopsavvy.com/data) for more information.