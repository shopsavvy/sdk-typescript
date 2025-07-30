# 🛍️ ShopSavvy Data API - TypeScript/JavaScript SDK

[![npm version](https://badge.fury.io/js/@shopsavvy/sdk.svg)](https://badge.fury.io/js/@shopsavvy/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/@shopsavvy/sdk)](https://www.npmjs.com/package/@shopsavvy/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**The most comprehensive TypeScript/JavaScript SDK for e-commerce product data and pricing intelligence.** 

Access real-time product information, pricing data, and historical trends across **thousands of retailers** and **millions of products** with the official [ShopSavvy Data API](https://shopsavvy.com/data).

---

## 🚀 Quick Start

### Installation

```bash
npm install @shopsavvy/sdk
# or
yarn add @shopsavvy/sdk
# or
pnpm add @shopsavvy/sdk
# or
bun add @shopsavvy/sdk
```

### Get Your API Key

1. 🌟 Visit [shopsavvy.com/data](https://shopsavvy.com/data)
2. 📝 Sign up for a free account
3. 💳 Choose a subscription plan
4. 🔑 Get your API key from the dashboard

### 30-Second Example

```typescript
import { createShopSavvyClient } from '@shopsavvy/sdk'

// Initialize the client
const api = createShopSavvyClient({
  apiKey: 'ss_live_your_api_key_here'
})

// Look up any product by barcode, ASIN, or URL
const product = await api.getProductDetails('012345678901')
console.log(`📦 ${product.data.name} by ${product.data.brand}`)

// Get current prices from all retailers
const offers = await api.getCurrentOffers('012345678901')
const cheapest = offers.data.reduce((min, offer) => offer.price < min.price ? offer : min)
console.log(`💰 Best price: $${cheapest.price} at ${cheapest.retailer}`)

// Set up price monitoring
await api.scheduleProductMonitoring('012345678901', 'daily')
console.log('🔔 Price alerts activated!')
```

---

## 🎯 Key Features

| Feature | Description | Use Cases |
|---------|-------------|-----------|
| 🔍 **Universal Product Lookup** | Search by barcode, ASIN, URL, model number | Product catalogs, inventory management |
| 💲 **Real-Time Pricing** | Current prices across major retailers | Price comparison, competitive analysis |
| 📈 **Historical Data** | Price trends and availability over time | Market research, pricing strategy |
| 🔔 **Smart Monitoring** | Automated price tracking and alerts | Price drops, stock notifications |
| 🏪 **Multi-Retailer Support** | Amazon, Walmart, Target, Best Buy + more | Comprehensive market coverage |
| ⚡ **Batch Operations** | Process multiple products efficiently | Bulk analysis, data processing |
| 🛡️ **Full TypeScript** | Complete type definitions and intellisense | Type-safe development |
| 📊 **Multiple Formats** | JSON and CSV response options | Easy data integration |

---

## 🏗️ Installation & Setup

### Basic Installation
```bash
npm install @shopsavvy/sdk
```

### Development Installation
```bash
git clone https://github.com/shopsavvy/sdk-typescript
cd sdk-typescript
npm install
npm run build
```

### Environment Setup
```bash
# Optional: Store your API key securely
export SHOPSAVVY_API_KEY="ss_live_your_api_key_here"
```

---

## 📖 Complete API Reference

### 🔧 Client Configuration

#### Method 1: Simple Client Creation (Recommended)
```typescript
import { createShopSavvyClient } from '@shopsavvy/sdk'

// Basic setup
const api = createShopSavvyClient({
  apiKey: 'ss_live_your_api_key_here'
})

// With custom timeout and base URL
const api = createShopSavvyClient({
  apiKey: 'ss_live_your_api_key_here',
  timeout: 60000,
  baseUrl: 'https://api.shopsavvy.com/v1'
})
```

#### Method 2: Direct Class Instantiation
```typescript
import { ShopSavvyDataAPI } from '@shopsavvy/sdk'

const api = new ShopSavvyDataAPI({
  apiKey: 'ss_live_your_api_key_here',
  timeout: 45000
})
```

#### Method 3: Environment Variable Configuration
```typescript
// Load API key from environment
const api = createShopSavvyClient({
  apiKey: process.env.SHOPSAVVY_API_KEY || 'ss_live_your_api_key_here'
})
```

### 🔍 Product Lookup

#### Single Product Lookup
```typescript
// Search by barcode (UPC/EAN)
const product = await api.getProductDetails('012345678901')

// Search by Amazon ASIN
const amazonProduct = await api.getProductDetails('B08N5WRWNW')

// Search by product URL
const urlProduct = await api.getProductDetails('https://www.amazon.com/dp/B08N5WRWNW')

// Search by model number
const modelProduct = await api.getProductDetails('iPhone-14-Pro')

// Access product information
console.log(`📦 Product: ${product.data.name}`)
console.log(`🏷️ Brand: ${product.data.brand}`)
console.log(`📂 Category: ${product.data.category}`)
console.log(`🔢 Product ID: ${product.data.product_id}`)
console.log(`📷 Image: ${product.data.image_url}`)
```

#### Batch Product Lookup
```typescript
// Look up multiple products at once
const identifiers = [
  '012345678901',           // Barcode
  'B08N5WRWNW',            // Amazon ASIN
  'https://www.target.com/p/example',  // URL
  'MODEL-ABC123'            // Model number
]

const products = await api.getProductDetailsBatch(identifiers)

for (const product of products.data) {
  console.log(`✅ Found: ${product.name} by ${product.brand}`)
  console.log(`   ID: ${product.product_id}`)
  console.log(`   Category: ${product.category}`)
  console.log('---')
}
```

#### CSV Format Support
```typescript
// Get product data in CSV format for easy processing
const productCsv = await api.getProductDetails('012345678901', { format: 'csv' })

// Process CSV data (example with a CSV parsing library)
// import { parse } from 'csv-parse/sync'
// const records = parse(productCsv.data, { columns: true, skip_empty_lines: true })
```

### 💰 Current Pricing

#### Get All Current Offers
```typescript
// Get prices from all retailers
const offers = await api.getCurrentOffers('012345678901')

console.log(`Found ${offers.data.length} offers:`)
for (const offer of offers.data) {
  console.log(`🏪 ${offer.retailer}: $${offer.price}`)
  console.log(`   📦 Condition: ${offer.condition}`)
  console.log(`   ✅ Available: ${offer.availability}`)
  console.log(`   🔗 Buy: ${offer.url}`)
  if (offer.shipping) {
    console.log(`   🚚 Shipping: $${offer.shipping}`)
  }
  console.log('---')
}
```

#### Retailer-Specific Pricing
```typescript
// Get offers from specific retailers
const amazonOffers = await api.getCurrentOffers('012345678901', { retailer: 'amazon' })
const walmartOffers = await api.getCurrentOffers('012345678901', { retailer: 'walmart' })
const targetOffers = await api.getCurrentOffers('012345678901', { retailer: 'target' })

console.log('Amazon prices:')
for (const offer of amazonOffers.data) {
  console.log(`  $${offer.price} - ${offer.condition}`)
}
```

#### Batch Pricing
```typescript
// Get current offers for multiple products
const products = ['012345678901', 'B08N5WRWNW', '045496596439']
const batchOffers = await api.getCurrentOffersBatch(products)

for (const [identifier, offers] of Object.entries(batchOffers.data)) {
  const bestPrice = offers.length > 0 ? Math.min(...offers.map(o => o.price)) : null
  const bestOffer = offers.find(o => o.price === bestPrice)
  
  if (bestOffer) {
    console.log(`${identifier}: Best price $${bestOffer.price} at ${bestOffer.retailer}`)
  } else {
    console.log(`${identifier}: No offers found`)
  }
}
```

### 📈 Price History & Trends

#### Basic Price History
```typescript
// Get 30 days of price history
const endDate = new Date().toISOString().split('T')[0]
const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const history = await api.getPriceHistory('012345678901', startDate, endDate)

for (const offer of history.data) {
  console.log(`🏪 ${offer.retailer}:`)
  console.log(`   💰 Current price: $${offer.price}`)
  console.log(`   📊 Historical points: ${offer.price_history.length}`)
  
  if (offer.price_history.length > 0) {
    const prices = offer.price_history.map(point => point.price)
    console.log(`   📉 Lowest: $${Math.min(...prices)}`)
    console.log(`   📈 Highest: $${Math.max(...prices)}`)
    console.log(`   📊 Average: $${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}`)
  }
  console.log('---')
}
```

#### Retailer-Specific History
```typescript
// Get price history from Amazon only
const amazonHistory = await api.getPriceHistory(
  '012345678901', 
  '2024-01-01', 
  '2024-01-31',
  { retailer: 'amazon' }
)

for (const offer of amazonHistory.data) {
  console.log(`Amazon price trends for ${offer.retailer}:`)
  // Last 10 data points
  const recentHistory = offer.price_history.slice(-10)
  for (const point of recentHistory) {
    console.log(`  ${point.date}: $${point.price} (${point.availability})`)
  }
}
```

### 🔔 Product Monitoring & Alerts

#### Schedule Single Product Monitoring
```typescript
// Monitor daily across all retailers
const result = await api.scheduleProductMonitoring('012345678901', 'daily')
if (result.data.scheduled) {
  console.log('✅ Daily monitoring activated!')
}

// Monitor hourly at specific retailer
const amazonResult = await api.scheduleProductMonitoring(
  '012345678901', 
  'hourly', 
  { retailer: 'amazon' }
)
console.log(`Amazon monitoring: ${JSON.stringify(amazonResult.data)}`)
```

#### Batch Monitoring Setup
```typescript
// Schedule multiple products for monitoring
const productsToMonitor = [
  '012345678901',
  'B08N5WRWNW', 
  '045496596439'
]

const batchResult = await api.scheduleProductMonitoringBatch(productsToMonitor, 'daily')

for (const item of batchResult.data) {
  if (item.scheduled) {
    console.log(`✅ Monitoring activated for ${item.identifier}`)
  } else {
    console.log(`❌ Failed to monitor ${item.identifier}`)
  }
}
```

#### Manage Scheduled Products
```typescript
// View all monitored products
const scheduled = await api.getScheduledProducts()
console.log(`📊 Currently monitoring ${scheduled.data.length} products:`)

for (const product of scheduled.data) {
  console.log(`🔔 ${product.identifier}`)
  console.log(`   📅 Frequency: ${product.frequency}`)
  console.log(`   🏪 Retailer: ${product.retailer || 'All retailers'}`)
  console.log(`   📅 Created: ${product.created_at}`)
  if (product.last_refreshed) {
    console.log(`   🔄 Last refresh: ${product.last_refreshed}`)
  }
  console.log('---')
}

// Remove products from monitoring
await api.removeProductFromSchedule('012345678901')
console.log('🗑️  Removed from monitoring')

// Remove multiple products
await api.removeProductsFromSchedule(['012345678901', 'B08N5WRWNW'])
console.log('🗑️  Batch removal complete')
```

### 📊 Usage & Analytics

```typescript
// Check your API usage
const usage = await api.getUsage()

console.log('📊 API Usage Summary:')
console.log(`💳 Plan: ${usage.data.plan_name}`)
console.log(`✅ Credits used: ${usage.data.credits_used.toLocaleString()}`)
console.log(`🔋 Credits remaining: ${usage.data.credits_remaining.toLocaleString()}`)
console.log(`📊 Total credits: ${usage.data.credits_total.toLocaleString()}`)
console.log(`📅 Billing period: ${usage.data.billing_period_start} to ${usage.data.billing_period_end}`)

// Calculate usage percentage
const usagePercent = (usage.data.credits_used / usage.data.credits_total) * 100
console.log(`📈 Usage: ${usagePercent.toFixed(1)}%`)
```

---

## 🛠️ Advanced Usage & Examples

### 🏆 Price Comparison Tool

```typescript
interface DealResult {
  identifier: string
  productName: string
  brand: string
  offers: Array<{
    retailer: string
    price: number
    totalCost: number
    condition: string
    url: string
    shipping?: number
  }>
  bestOffer: {
    retailer: string
    price: number
    totalCost: number
    url: string
  }
  savings: number
}

async function findBestDeals(identifier: string, maxResults = 5): Promise<DealResult | null> {
  try {
    // Get product info
    const product = await api.getProductDetails(identifier)
    console.log(`🔍 Searching deals for: ${product.data.name}`)
    console.log(`📦 Brand: ${product.data.brand}`)
    console.log('='.repeat(50))
    
    // Get all current offers
    const offers = await api.getCurrentOffers(identifier)
    
    if (offers.data.length === 0) {
      console.log('❌ No offers found')
      return null
    }
    
    // Filter and sort offers
    const availableOffers = offers.data.filter(offer => offer.availability === 'in_stock')
    
    if (availableOffers.length === 0) {
      console.log('❌ No in-stock offers found')
      return null
    }
    
    // Calculate total cost (price + shipping)
    const offersWithTotal = availableOffers.map(offer => ({
      ...offer,
      totalCost: offer.price + (offer.shipping || 0)
    }))
    
    const sortedOffers = offersWithTotal
      .sort((a, b) => a.totalCost - b.totalCost)
      .slice(0, maxResults)
    
    console.log(`🏆 Top ${sortedOffers.length} Deals:`)
    sortedOffers.forEach((offer, i) => {
      console.log(`${i + 1}. 🏪 ${offer.retailer}`)
      console.log(`   💰 Price: $${offer.price}`)
      if (offer.shipping) {
        console.log(`   🚚 Shipping: $${offer.shipping}`)
      }
      console.log(`   💳 Total: $${offer.totalCost}`)
      console.log(`   📦 Condition: ${offer.condition}`)
      console.log(`   🔗 Buy now: ${offer.url}`)
      console.log('---')
    })
    
    // Calculate savings
    const savings = sortedOffers.length > 1 
      ? sortedOffers[sortedOffers.length - 1].totalCost - sortedOffers[0].totalCost 
      : 0
    
    if (savings > 0) {
      console.log(`💰 Potential savings: $${savings.toFixed(2)}`)
    }
    
    return {
      identifier,
      productName: product.data.name,
      brand: product.data.brand || '',
      offers: sortedOffers.map(o => ({
        retailer: o.retailer,
        price: o.price,
        totalCost: o.totalCost,
        condition: o.condition,
        url: o.url,
        shipping: o.shipping
      })),
      bestOffer: {
        retailer: sortedOffers[0].retailer,
        price: sortedOffers[0].price,
        totalCost: sortedOffers[0].totalCost,
        url: sortedOffers[0].url
      },
      savings
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : error}`)
    return null
  }
}

// Usage
const deals = await findBestDeals('012345678901')
```

### 🚨 Smart Price Alert System

```typescript
interface PriceAlert {
  identifier: string
  targetPrice: number
  currentPrice?: number
  lastChecked?: Date
}

class PriceAlertBot {
  private alerts: Map<string, PriceAlert> = new Map()

  constructor(private api: ShopSavvyDataAPI) {}

  async addAlert(identifier: string, targetPrice: number): Promise<void> {
    this.alerts.set(identifier, { identifier, targetPrice })
    
    // Schedule monitoring
    await this.api.scheduleProductMonitoring(identifier, 'daily')
    console.log(`🔔 Alert set: ${identifier} @ $${targetPrice}`)
  }

  async checkAlerts(): Promise<void> {
    console.log(`🔍 Checking ${this.alerts.size} price alerts...`)
    
    for (const [identifier, alert] of this.alerts) {
      try {
        const offers = await this.api.getCurrentOffers(identifier)
        if (offers.data.length === 0) continue
        
        // Find best available offer
        const inStockOffers = offers.data.filter(o => o.availability === 'in_stock')
        if (inStockOffers.length === 0) continue
        
        const bestOffer = inStockOffers.reduce((min, offer) => 
          offer.price < min.price ? offer : min
        )
        
        // Update alert with current price
        alert.currentPrice = bestOffer.price
        alert.lastChecked = new Date()
        
        if (bestOffer.price <= alert.targetPrice) {
          await this.triggerAlert(identifier, bestOffer, alert.targetPrice)
        }
        
      } catch (error) {
        console.error(`❌ Error checking ${identifier}: ${error instanceof Error ? error.message : error}`)
      }
    }
  }

  private async triggerAlert(identifier: string, offer: any, targetPrice: number): Promise<void> {
    const product = await this.api.getProductDetails(identifier)
    
    console.log('🚨'.repeat(10))
    console.log('💰 PRICE ALERT TRIGGERED!')
    console.log(`📦 Product: ${product.data.name}`)
    console.log(`🎯 Target: $${targetPrice}`)
    console.log(`💸 Current: $${offer.price} at ${offer.retailer}`)
    console.log(`✅ Savings: $${(targetPrice - offer.price).toFixed(2)}`)
    console.log(`🔗 Buy now: ${offer.url}`)
    console.log('🚨'.repeat(10))
    
    // Remove alert after triggering
    this.alerts.delete(identifier)
  }

  getAlerts(): PriceAlert[] {
    return Array.from(this.alerts.values())
  }

  removeAlert(identifier: string): boolean {
    return this.alerts.delete(identifier)
  }
}

// Usage
const alertBot = new PriceAlertBot(api)
await alertBot.addAlert('012345678901', 199.99)
await alertBot.addAlert('B08N5WRWNW', 299.99)

// Run periodic checks
await alertBot.checkAlerts()
```

### 📊 Market Analysis Dashboard

```typescript
interface RetailerStats {
  currentPrice: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  volatility: number
  dataPoints: number
  trend: string
}

interface MarketAnalysis {
  identifier: string
  productName: string
  brand: string
  category: string
  retailerStats: Record<string, RetailerStats>
  bestRetailer: {
    name: string
    price: number
  } | null
}

async function analyzeMarketTrends(identifiers: string[], days = 30): Promise<MarketAnalysis[]> {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  console.log(`📊 Market Analysis Report (${days} days)`)
  console.log('='.repeat(50))
  
  const results: MarketAnalysis[] = []
  
  for (const identifier of identifiers) {
    try {
      // Get product info
      const product = await api.getProductDetails(identifier)
      console.log(`\\n📦 ${product.data.name}`)
      console.log(`🏷️  ${product.data.brand} | ${product.data.category}`)
      console.log('-'.repeat(40))
      
      // Get price history
      const history = await api.getPriceHistory(identifier, startDate, endDate)
      
      const retailerStats: Record<string, RetailerStats> = {}
      
      for (const offer of history.data) {
        if (offer.price_history.length === 0) continue
        
        const prices = offer.price_history.map(point => point.price)
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
        const variance = prices.reduce((a, b) => a + Math.pow(b - avgPrice, 2), 0) / prices.length
        
        retailerStats[offer.retailer] = {
          currentPrice: offer.price,
          avgPrice,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          volatility: Math.sqrt(variance),
          dataPoints: prices.length,
          trend: calculateTrend(prices)
        }
      }
      
      // Display results
      if (Object.keys(retailerStats).length > 0) {
        console.log('🏪 Retailer Analysis:')
        for (const [retailer, stats] of Object.entries(retailerStats)) {
          console.log(`  ${retailer}:`)
          console.log(`    💰 Current: $${stats.currentPrice}`)
          console.log(`    📊 Average: $${stats.avgPrice.toFixed(2)}`)
          console.log(`    📉 Min: $${stats.minPrice} | 📈 Max: $${stats.maxPrice}`)
          console.log(`    📈 Trend: ${stats.trend}`)
          console.log(`    📊 Data points: ${stats.dataPoints}`)
        }
        
        // Find best value
        const bestRetailerEntry = Object.entries(retailerStats)
          .reduce((min, [name, stats]) => stats.currentPrice < min[1].currentPrice ? [name, stats] : min)
        
        console.log(`\\n🏆 Best Price: ${bestRetailerEntry[0]} @ $${bestRetailerEntry[1].currentPrice}`)
        
        results.push({
          identifier,
          productName: product.data.name,
          brand: product.data.brand || '',
          category: product.data.category || '',
          retailerStats,
          bestRetailer: {
            name: bestRetailerEntry[0],
            price: bestRetailerEntry[1].currentPrice
          }
        })
      } else {
        console.log('❌ No price history available')
        results.push({
          identifier,
          productName: product.data.name,
          brand: product.data.brand || '',
          category: product.data.category || '',
          retailerStats: {},
          bestRetailer: null
        })
      }
      
    } catch (error) {
      console.error(`❌ Error analyzing ${identifier}: ${error instanceof Error ? error.message : error}`)
    }
  }
  
  return results
}

function calculateTrend(prices: number[]): string {
  if (prices.length < 2) return 'Unknown'
  
  const recent = prices.slice(-7) // Last week
  const older = prices.slice(0, -7) // Everything else
  
  if (older.length === 0) return 'New'
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
  
  if (recentAvg > olderAvg * 1.05) { // 5% threshold
    return '📈 Rising'
  } else if (recentAvg < olderAvg * 0.95) {
    return '📉 Falling'
  } else {
    return '➡️  Stable'
  }
}

// Usage
const productsToAnalyze = [
  '012345678901',
  'B08N5WRWNW',
  '045496596439'
]

const analysis = await analyzeMarketTrends(productsToAnalyze, 60)
```

### 🔄 Bulk Product Management

```typescript
interface BulkProductData {
  identifier: string
  targetPrice: number
  monitor: boolean
}

interface BulkAnalysisResult {
  identifier: string
  name: string
  brand: string
  targetPrice: number
  currentBestPrice: number | null
  priceAlert: boolean
  offersCount: number
}

async function bulkProductManager(csvData: BulkProductData[]): Promise<BulkAnalysisResult[]> {
  console.log('📂 Loading products from data...')
  console.log(`📊 Processing ${csvData.length} products...`)
  
  // Batch lookup
  const identifiers = csvData.map(p => p.identifier)
  
  try {
    const [productDetails, currentOffers] = await Promise.all([
      api.getProductDetailsBatch(identifiers),
      api.getCurrentOffersBatch(identifiers)
    ])
    
    const results: BulkAnalysisResult[] = []
    
    for (let i = 0; i < csvData.length; i++) {
      const productData = csvData[i]
      const details = productDetails.data[i]
      const offers = currentOffers.data[productData.identifier] || []
      
      const inStockOffers = offers.filter(o => o.availability === 'in_stock')
      const bestPrice = inStockOffers.length > 0 
        ? Math.min(...inStockOffers.map(o => o.price)) 
        : null
      
      const result: BulkAnalysisResult = {
        identifier: productData.identifier,
        name: details.name,
        brand: details.brand || '',
        targetPrice: productData.targetPrice,
        currentBestPrice: bestPrice,
        priceAlert: bestPrice !== null && bestPrice <= productData.targetPrice,
        offersCount: offers.length
      }
      
      results.push(result)
      
      // Setup monitoring if requested
      if (productData.monitor) {
        await api.scheduleProductMonitoring(productData.identifier, 'daily')
      }
    }
    
    // Generate report
    console.log('\\n📊 Bulk Analysis Report:')
    console.log('='.repeat(80))
    
    for (const result of results) {
      const status = result.priceAlert ? '🚨 ALERT' : '📊 TRACKING'
      console.log(`${status} | ${result.name} by ${result.brand}`)
      console.log(`    🎯 Target: $${result.targetPrice} | 💰 Current: ${result.currentBestPrice ? `$${result.currentBestPrice}` : 'N/A'}`)
      console.log(`    🏪 Offers: ${result.offersCount}`)
      console.log()
    }
    
    return results
    
  } catch (error) {
    console.error(`❌ Error processing bulk products: ${error instanceof Error ? error.message : error}`)
    return []
  }
}

// Usage with sample data
const sampleData: BulkProductData[] = [
  { identifier: '012345678901', targetPrice: 199.99, monitor: true },
  { identifier: 'B08N5WRWNW', targetPrice: 299.99, monitor: true },
  { identifier: '045496596439', targetPrice: 49.99, monitor: false }
]

const bulkResults = await bulkProductManager(sampleData)
```

### 🌐 Multi-Format Data Export

```typescript
interface ExportData {
  exportedAt: string
  products: Array<{
    product: any
    offers: any[]
  }>
}

async function exportProductData(identifiers: string[], format: 'json' | 'csv' = 'json'): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toTimeString().split(' ')[0].replace(/:/g, '')
  
  if (format.toLowerCase() === 'json') {
    // Export as JSON
    const [products, offers] = await Promise.all([
      api.getProductDetailsBatch(identifiers),
      api.getCurrentOffersBatch(identifiers)
    ])
    
    const exportData: ExportData = {
      exportedAt: new Date().toISOString(),
      products: products.data.map(product => ({
        product,
        offers: offers.data[product.product_id] || []
      }))
    }
    
    const filename = `shopsavvy_export_${timestamp}.json`
    
    // In Node.js environment
    if (typeof window === 'undefined') {
      const fs = await import('fs')
      fs.writeFileSync(filename, JSON.stringify(exportData, null, 2))
    } else {
      // In browser environment
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
    
    console.log(`✅ Exported ${products.data.length} products to ${filename}`)
    
  } else if (format.toLowerCase() === 'csv') {
    // Export as CSV
    const filename = `shopsavvy_export_${timestamp}.csv`
    const csvRows = ['product_id,name,brand,category,barcode,retailer,price,availability,condition,url']
    
    for (const identifier of identifiers) {
      try {
        const [product, offers] = await Promise.all([
          api.getProductDetails(identifier),
          api.getCurrentOffers(identifier)
        ])
        
        for (const offer of offers.data) {
          const row = [
            product.data.product_id,
            `"${product.data.name}"`,
            `"${product.data.brand || ''}"`,
            `"${product.data.category || ''}"`,
            product.data.barcode || '',
            offer.retailer,
            offer.price,
            offer.availability,
            offer.condition,
            `"${offer.url}"`
          ].join(',')
          
          csvRows.push(row)
        }
      } catch (error) {
        console.error(`❌ Error exporting ${identifier}: ${error instanceof Error ? error.message : error}`)
      }
    }
    
    const csvContent = csvRows.join('\\n')
    
    // In Node.js environment
    if (typeof window === 'undefined') {
      const fs = await import('fs')
      fs.writeFileSync(filename, csvContent)
    } else {
      // In browser environment
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
    
    console.log(`✅ Exported data to ${filename}`)
  }
}

// Usage
await exportProductData(['012345678901', 'B08N5WRWNW'], 'json')
await exportProductData(['012345678901', 'B08N5WRWNW'], 'csv')
```

---

## 🔧 Error Handling & Best Practices

### Comprehensive Error Handling

```typescript
// Custom error types for better error handling
class ShopSavvyError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message)
    this.name = 'ShopSavvyError'
  }
}

async function robustProductLookup(identifier: string): Promise<{ product: any; offers: any[] } | null> {
  try {
    const [product, offers] = await Promise.all([
      api.getProductDetails(identifier),
      api.getCurrentOffers(identifier)
    ])
    
    console.log(`✅ Success: ${product.data.name}`)
    console.log(`💰 Found ${offers.data.length} offers`)
    
    return { product: product.data, offers: offers.data }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('Invalid API key')) {
      console.error('❌ Authentication failed - check your API key')
      console.log('🔑 Get your key at: https://shopsavvy.com/data/dashboard')
    } else if (errorMessage.includes('Product not found') || errorMessage.includes('404')) {
      console.error(`❌ Product not found: ${identifier}`)
      console.log('💡 Try a different identifier (barcode, ASIN, URL)')
    } else if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
      console.error('⏳ Rate limit exceeded - please slow down')
      console.log('💡 Consider upgrading your plan for higher limits')
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 60000))
    } else if (errorMessage.includes('timeout')) {
      console.error('⏱️  Request timeout - API might be slow')
      console.log('💡 Try increasing timeout or retry later')
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      console.error(`🌐 Network error: ${errorMessage}`)
      console.log('💡 Check your internet connection')
    } else {
      console.error(`🚨 API Error: ${errorMessage}`)
      console.log('💡 This might be a temporary issue')
    }
    
    return null
  }
}

// Usage with retry logic
async function lookupWithRetry(identifier: string, maxRetries = 3): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await api.getProductDetails(identifier)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff
          console.log(`⏳ Retry ${attempt + 1}/${maxRetries} in ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else {
          throw error
        }
      } else {
        throw error // Don't retry for non-transient errors
      }
    }
  }
}
```

### Rate Limiting Best Practices

```typescript
class RateLimiter {
  private lastCallTime = 0
  private readonly minInterval: number

  constructor(callsPerSecond = 10) {
    this.minInterval = 1000 / callsPerSecond
  }

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    const elapsed = Date.now() - this.lastCallTime
    const leftToWait = this.minInterval - elapsed
    
    if (leftToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, leftToWait))
    }
    
    this.lastCallTime = Date.now()
    return fn()
  }
}

// Rate-limited API calls
const rateLimiter = new RateLimiter(5) // Max 5 calls per second

async function safeGetOffers(identifier: string) {
  return rateLimiter.throttle(() => api.getCurrentOffers(identifier))
}

// Batch processing with rate limiting
async function processProductsSafely(identifiers: string[]): Promise<Array<{ identifier: string; offers: any[] | null }>> {
  const results: Array<{ identifier: string; offers: any[] | null }> = []
  
  for (let i = 0; i < identifiers.length; i++) {
    const identifier = identifiers[i]
    console.log(`🔄 Processing ${i + 1}/${identifiers.length}: ${identifier}`)
    
    try {
      const offers = await safeGetOffers(identifier)
      results.push({ identifier, offers: offers.data })
      console.log(`   ✅ Found ${offers.data.length} offers`)
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : error}`)
      results.push({ identifier, offers: null })
    }
  }
  
  return results
}
```

### Configuration Management

```typescript
interface ShopSavvySettings {
  apiKey: string
  timeout: number
  maxRetries: number
  rateLimit: number // calls per second
  baseUrl?: string
}

class ConfigManager {
  private settings: ShopSavvySettings

  constructor() {
    this.settings = this.loadFromEnvironment()
  }

  private loadFromEnvironment(): ShopSavvySettings {
    const apiKey = process.env.SHOPSAVVY_API_KEY
    if (!apiKey) {
      throw new Error('SHOPSAVVY_API_KEY environment variable required')
    }

    return {
      apiKey,
      timeout: parseInt(process.env.SHOPSAVVY_TIMEOUT || '30000'),
      maxRetries: parseInt(process.env.SHOPSAVVY_MAX_RETRIES || '3'),
      rateLimit: parseFloat(process.env.SHOPSAVVY_RATE_LIMIT || '10'),
      baseUrl: process.env.SHOPSAVVY_BASE_URL
    }
  }

  getSettings(): ShopSavvySettings {
    return { ...this.settings }
  }

  createClient(): ShopSavvyDataAPI {
    return createShopSavvyClient({
      apiKey: this.settings.apiKey,
      timeout: this.settings.timeout,
      baseUrl: this.settings.baseUrl
    })
  }
}

// Usage
const config = new ConfigManager()
const api = config.createClient()
```

---

## 🧪 Testing & Development

### Running Tests

```bash
# Install development dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern=client.test.ts

# Run with verbose output
npm test -- --verbose
```

### Code Quality

```bash
# Lint code
npm run lint

# Build the project
npm run build

# Watch for changes during development
npm run dev
```

### Example Test

```typescript
import { createShopSavvyClient, ShopSavvyDataAPI } from '../src/index'

// Mock fetch for testing
global.fetch = jest.fn()

describe('ShopSavvy SDK', () => {
  let api: ShopSavvyDataAPI
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    api = createShopSavvyClient({
      apiKey: 'ss_test_valid_key'
    })
    mockFetch.mockClear()
  })

  it('should create client with valid API key', () => {
    expect(api).toBeInstanceOf(ShopSavvyDataAPI)
  })

  it('should throw error for invalid API key', () => {
    expect(() => {
      createShopSavvyClient({ apiKey: 'invalid_key_format' })
    }).toThrow('Invalid API key format')
  })

  it('should fetch product details successfully', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          product_id: '12345',
          name: 'Test Product',
          brand: 'Test Brand'
        }
      })
    } as Response)

    const product = await api.getProductDetails('012345678901')
    
    expect(product.success).toBe(true)
    expect(product.data.name).toBe('Test Product')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should handle API errors gracefully', async () => {
    // Mock error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Product not found' })
    } as Response)

    await expect(api.getProductDetails('invalid-id')).rejects.toThrow('Product not found')
  })
})
```

---

## 🚀 Production Deployment

### Docker Setup

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY dist/ ./dist/

# Set environment variables
ENV SHOPSAVVY_API_KEY="your_api_key_here"
ENV SHOPSAVVY_TIMEOUT="30000"

# Expose port
EXPOSE 3000

# Run application
CMD ["node", "dist/index.js"]
```

### AWS Lambda Example

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createShopSavvyClient } from '@shopsavvy/sdk'

// Initialize client outside handler for connection reuse
const api = createShopSavvyClient({
  apiKey: process.env.SHOPSAVVY_API_KEY!
})

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const identifier = event.queryStringParameters?.identifier
    if (!identifier) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'identifier parameter required' })
      }
    }

    // Get product data
    const [product, offers] = await Promise.all([
      api.getProductDetails(identifier),
      api.getCurrentOffers(identifier)
    ])

    // Find best price
    const inStockOffers = offers.data.filter(o => o.availability === 'in_stock')
    const bestOffer = inStockOffers.length > 0 
      ? inStockOffers.reduce((min, offer) => offer.price < min.price ? offer : min)
      : null

    const response = {
      product: {
        name: product.data.name,
        brand: product.data.brand,
        category: product.data.category
      },
      best_price: bestOffer ? {
        price: bestOffer.price,
        retailer: bestOffer.retailer,
        url: bestOffer.url
      } : null,
      total_offers: offers.data.length
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    }

  } catch (error) {
    console.error('Lambda error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      })
    }
  }
}
```

### Environment Variables

```bash
# Required
export SHOPSAVVY_API_KEY="ss_live_your_api_key_here"

# Optional
export SHOPSAVVY_TIMEOUT="30000"
export SHOPSAVVY_BASE_URL="https://api.shopsavvy.com/v1"
export SHOPSAVVY_MAX_RETRIES="3"
```

---

## 🌟 Real-World Use Cases

### 🛒 E-commerce Platform Integration

```typescript
class EcommerceIntegration {
  constructor(private api: ShopSavvyDataAPI) {}

  async enrichProductCatalog(productSkus: string[]): Promise<any[]> {
    const enrichedProducts = []

    for (const sku of productSkus) {
      try {
        // Get competitive pricing
        const offers = await this.api.getCurrentOffers(sku)
        const competitorPrices = offers.data
          .filter(offer => offer.retailer !== 'your-store')
          .map(offer => offer.price)

        const enrichment = {
          sku,
          competitor_count: competitorPrices.length,
          min_competitor_price: competitorPrices.length > 0 ? Math.min(...competitorPrices) : null,
          avg_competitor_price: competitorPrices.length > 0 ? 
            competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length : null,
          price_position: this.calculatePricePosition(sku, competitorPrices)
        }

        enrichedProducts.push(enrichment)

      } catch (error) {
        console.error(`❌ Error enriching ${sku}: ${error instanceof Error ? error.message : error}`)
      }
    }

    return enrichedProducts
  }

  private calculatePricePosition(sku: string, competitorPrices: number[]): string {
    if (competitorPrices.length === 0) return 'no_competition'

    const yourPrice = this.getYourPrice(sku) // Your implementation
    if (!yourPrice) return 'unknown'

    const cheaperCount = competitorPrices.filter(price => price < yourPrice).length
    const totalCompetitors = competitorPrices.length

    if (cheaperCount === 0) return 'most_expensive'
    if (cheaperCount === totalCompetitors) return 'cheapest'
    if (cheaperCount < totalCompetitors / 3) return 'premium'
    if (cheaperCount > totalCompetitors * 2/3) return 'budget'
    return 'competitive'
  }

  private getYourPrice(sku: string): number | null {
    // Implement your price lookup logic
    return null
  }
}
```

### 🏢 Business Intelligence Dashboard

```typescript
interface MarketInsights {
  avgPriceTrend: number
  topRetailers: Record<string, number>
  availabilityBreakdown: Record<string, number>
  marketVolatility: number
}

class BusinessIntelligenceDashboard {
  constructor(private api: ShopSavvyDataAPI) {}

  async generateMarketReport(category: string, timePeriodDays = 30): Promise<any> {
    // Get category products (you'd have your own product database)
    const categoryProducts = this.getCategoryProducts(category)

    const report = {
      category,
      analysis_date: new Date().toISOString(),
      time_period_days: timePeriodDays,
      products_analyzed: categoryProducts.length,
      insights: {} as MarketInsights
    }

    // Analyze each product
    const priceTrends: number[] = []
    const retailerCoverage = new Map<string, number>()
    const availabilityStats = new Map<string, number>()

    for (const productId of categoryProducts) {
      try {
        // Get current market state
        const offers = await this.api.getCurrentOffers(productId)

        for (const offer of offers.data) {
          retailerCoverage.set(offer.retailer, (retailerCoverage.get(offer.retailer) || 0) + 1)
          availabilityStats.set(offer.availability, (availabilityStats.get(offer.availability) || 0) + 1)
        }

        // Get price trends
        const startDate = new Date(Date.now() - timePeriodDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const endDate = new Date().toISOString().split('T')[0]

        const history = await this.api.getPriceHistory(productId, startDate, endDate)

        for (const offerHistory of history.data) {
          if (offerHistory.price_history.length > 0) {
            const prices = offerHistory.price_history.map(p => p.price)
            const trend = this.calculateTrendPercentage(prices)
            priceTrends.push(trend)
          }
        }

      } catch (error) {
        console.error(`❌ Error analyzing ${productId}: ${error instanceof Error ? error.message : error}`)
      }
    }

    // Compile insights
    report.insights = {
      avgPriceTrend: priceTrends.length > 0 ? priceTrends.reduce((a, b) => a + b, 0) / priceTrends.length : 0,
      topRetailers: Object.fromEntries(
        Array.from(retailerCoverage.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
      ),
      availabilityBreakdown: Object.fromEntries(availabilityStats),
      marketVolatility: priceTrends.length > 1 ? this.calculateStandardDeviation(priceTrends) : 0
    }

    return report
  }

  private getCategoryProducts(category: string): string[] {
    // Implement your product database lookup
    return []
  }

  private calculateTrendPercentage(prices: number[]): number {
    if (prices.length < 2) return 0
    return ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
  }

  private calculateStandardDeviation(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const squareDiffs = values.map(value => Math.pow(value - avg, 2))
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
    return Math.sqrt(avgSquareDiff)
  }
}
```

### 📱 Express.js API Backend

```typescript
import express from 'express'
import cors from 'cors'
import { createShopSavvyClient } from '@shopsavvy/sdk'

const app = express()
const api = createShopSavvyClient({
  apiKey: process.env.SHOPSAVVY_API_KEY!
})

app.use(cors())
app.use(express.json())

// Handle barcode scans from mobile app
app.post('/api/product/scan', async (req, res) => {
  try {
    const { barcode } = req.body
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode required' })
    }

    // Get product details and offers in parallel
    const [product, offers] = await Promise.all([
      api.getProductDetails(barcode),
      api.getCurrentOffers(barcode)
    ])

    // Find best deals
    const availableOffers = offers.data.filter(o => o.availability === 'in_stock')
    const bestOffer = availableOffers.length > 0 
      ? availableOffers.reduce((min, offer) => offer.price < min.price ? offer : min)
      : null

    const response = {
      product: {
        name: product.data.name,
        brand: product.data.brand,
        image_url: product.data.image_url,
        category: product.data.category
      },
      pricing: {
        best_price: bestOffer?.price || null,
        best_retailer: bestOffer?.retailer || null,
        buy_url: bestOffer?.url || null,
        total_offers: availableOffers.length,
        all_offers: availableOffers.slice(0, 5).map(offer => ({
          retailer: offer.retailer,
          price: offer.price,
          availability: offer.availability,
          condition: offer.condition,
          url: offer.url
        }))
      }
    }

    res.json(response)

  } catch (error) {
    console.error('Scan error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
})

// Create price alert for mobile users
app.post('/api/product/alerts', async (req, res) => {
  try {
    const { product_id, target_price, user_id } = req.body

    // Schedule monitoring
    const result = await api.scheduleProductMonitoring(product_id, 'daily')

    // Store alert in your database
    // await storePrice Alert(user_id, product_id, target_price)

    res.json({
      success: true,
      message: 'Price alert created successfully',
      monitoring_active: result.data.scheduled
    })

  } catch (error) {
    console.error('Alert creation error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with tests
4. **Run the test suite**: `npm test`
5. **Submit a pull request**

---

## 📚 Additional Resources

| Resource | Link | Description |
|----------|------|-------------|
| 🌐 **API Documentation** | [shopsavvy.com/data/documentation](https://shopsavvy.com/data/documentation) | Complete API reference |
| 📊 **Dashboard** | [shopsavvy.com/data/dashboard](https://shopsavvy.com/data/dashboard) | Manage your API keys and usage |
| 💬 **Support** | [business@shopsavvy.com](mailto:business@shopsavvy.com) | Get help from our team |
| 🐛 **Issues** | [GitHub Issues](https://github.com/shopsavvy/sdk-typescript/issues) | Report bugs and request features |
| 📦 **npm Package** | [npmjs.com/package/@shopsavvy/sdk](https://www.npmjs.com/package/@shopsavvy/sdk) | Package repository |
| 📖 **Changelog** | [GitHub Releases](https://github.com/shopsavvy/sdk-typescript/releases) | Version history and updates |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏢 About ShopSavvy

**ShopSavvy** has been helping shoppers save money since 2008. With over **40 million downloads** and **millions of active users**, we're the most trusted name in price comparison and shopping intelligence.

Our **Data API** provides the same powerful product data and pricing intelligence that powers our consumer app, now available to developers and businesses worldwide.

### Why Choose ShopSavvy?

- ✅ **13+ Years** of e-commerce data expertise
- ✅ **Millions of Products** across thousands of retailers
- ✅ **Real-Time Data** updated continuously
- ✅ **Enterprise Scale** trusted by major brands
- ✅ **Developer Friendly** with comprehensive tools and support

---

**🚀 Ready to get started?** [Get your API key](https://shopsavvy.com/data) and start building amazing e-commerce applications today!

**💬 Need help?** Contact us at [business@shopsavvy.com](mailto:business@shopsavvy.com) or visit [shopsavvy.com/data](https://shopsavvy.com/data) for more information.

---

<div align="center">

**Made with ❤️ by the ShopSavvy Team**

[Website](https://shopsavvy.com) • [API Docs](https://shopsavvy.com/data/documentation) • [Dashboard](https://shopsavvy.com/data/dashboard) • [Support](mailto:business@shopsavvy.com)

</div>