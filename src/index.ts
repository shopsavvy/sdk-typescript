/**
 * Official TypeScript/JavaScript SDK for ShopSavvy Data API
 *
 * This SDK provides a convenient interface to interact with the ShopSavvy Data API,
 * allowing you to access product data, pricing information, and price history
 * across thousands of retailers and millions of products.
 *
 * @see https://shopsavvy.com/data
 */

export interface ShopSavvyConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
}

/**
 * API response metadata containing credit usage info
 */
export interface APIMeta {
  credits_used: number
  credits_remaining: number
  rate_limit_remaining?: number
}

/**
 * Product details from ShopSavvy API
 */
export interface ProductDetails {
  /** Product title */
  title: string
  /** ShopSavvy product ID */
  shopsavvy: string
  /** Product brand */
  brand?: string
  /** Product category */
  category?: string
  /** Product image URLs */
  images?: string[]
  /** Product barcode */
  barcode?: string
  /** Amazon ASIN */
  amazon?: string
  /** Product model number */
  model?: string
  /** Manufacturer part number */
  mpn?: string
  /** Product color */
  color?: string
  /** Shortened human-friendly title */
  title_short?: string
  /** URL-friendly slug */
  slug?: string
  /** Product descriptions keyed by retailer */
  descriptions?: Record<string, string>
  /** Array of category paths */
  categories?: string[]
  /** Product specifications keyed by retailer */
  attributes?: Record<string, Record<string, string>>
  /** Customer ratings keyed by retailer */
  ratings?: Record<string, { rating_out_of_5: number; count: number }>
  /** Expert review scores */
  scores?: { overall?: number; customer?: number; professional?: number; justification?: string }
  /** Computed quality scores */
  scores_synthetic?: { overall?: number; value?: number; features?: number; reliability?: number }
  /** Curated review summary */
  review_summary?: { pros: string[]; cons: string[]; bottom_line: string }
  /** Relevant search keywords */
  keywords?: string[]
  /** Pricing summary by currency */
  prices_summary?: Record<string, { cheapest?: number; cheapestNew?: number; full?: number; retailers?: number }>
  /** All known product identifiers */
  identifiers?: Record<string, string | number>
  /** Community engagement */
  social?: { likes: number; dislikes: number }
  /** When product was first added */
  created_at?: string
  /** When product data was last refreshed */
  updated_at?: string

  // Convenience getters (for backward compatibility)
  /** @deprecated Use `title` instead */
  get name(): string
  /** @deprecated Use `shopsavvy` instead */
  get product_id(): string
  /** @deprecated Use `amazon` instead */
  get asin(): string | undefined
  /** @deprecated Use `images[0]` instead */
  get image_url(): string | undefined
}

/**
 * Product with nested offers (returned by offers endpoint)
 */
export interface ProductWithOffers extends ProductDetails {
  offers: Offer[]
}

/**
 * Product offer from a retailer
 */
export interface Offer {
  /** Unique offer identifier */
  id: string
  /** Retailer name */
  retailer?: string
  /** Offer price */
  price?: number
  /** Price currency */
  currency?: string
  /** Product availability */
  availability?: string
  /** Product condition */
  condition?: string
  /** Link to product page */
  URL?: string
  /** Marketplace seller name */
  seller?: string
  /** Last update timestamp */
  timestamp?: string
  /** Price history */
  history?: Array<{ date: string; price: number; availability: string }>

  // Convenience getters (for backward compatibility)
  /** @deprecated Use `id` instead */
  get offer_id(): string
  /** @deprecated Use `URL` instead */
  get url(): string | undefined
  /** @deprecated Use `timestamp` instead */
  get last_updated(): string | undefined
}

export interface PriceHistoryEntry {
  date: string
  price: number
  availability: string
}

export interface OfferWithHistory extends Offer {
  price_history: PriceHistoryEntry[]
}

export interface ScheduledProduct {
  product_id: string
  identifier: string
  frequency: 'hourly' | 'daily' | 'weekly'
  retailer?: string
  created_at: string
  last_refreshed?: string
}

/**
 * Current billing period details
 */
export interface UsagePeriod {
  start_date: string
  end_date: string
  credits_used: number
  credits_limit: number
  credits_remaining: number
  requests_made: number
}

/**
 * API usage information
 */
export interface UsageInfo {
  current_period: UsagePeriod
  usage_percentage: number

  // Convenience getters (for backward compatibility)
  /** @deprecated Use `current_period.credits_used` instead */
  get credits_used(): number
  /** @deprecated Use `current_period.credits_remaining` instead */
  get credits_remaining(): number
  /** @deprecated Use `current_period.credits_limit` instead */
  get credits_total(): number
  /** @deprecated Use `current_period.start_date` instead */
  get billing_period_start(): string
  /** @deprecated Use `current_period.end_date` instead */
  get billing_period_end(): string
}

export interface PaginationInfo {
  total: number
  limit: number
  offset: number
  returned: number
}

export interface ProductSearchResult {
  success: boolean
  data: ProductDetails[]
  pagination: PaginationInfo
  meta?: APIMeta

  // Convenience getters
  get credits_used(): number
  get credits_remaining(): number
}

/**
 * A shopping deal with expert grading
 */
export interface Deal {
  path: string
  title: string
  subtitle?: string
  description?: string
  emoji?: string
  grade: {
    letter: string
    suffix?: string
    value: number
    justification?: string
  }
  pricing: {
    current: number
    original?: number
    currency: string
  }
  retailer: {
    name: string
  }
  product?: string
  url: string
  image?: { url: string }
  votes: {
    upvotes: number
    downvotes: number
    score: number
  }
  comment_count: number
  tags?: { slug: string; display: string }[]
  product_scores?: Record<string, number>
  expires_at?: string
  created_at: string
}

export interface DealsResponse {
  success: boolean
  deals: Deal[]
  pagination: {
    total: number
    has_more: boolean
    limit: number
    offset: number
  }
  meta?: APIMeta
}

/**
 * A TLDR product review with expert scores
 */
export interface TLDRReview {
  slug: string
  headline: string
  pros: string[]
  cons: string[]
  bottom_line: string
  scores?: {
    overall?: number
    customer?: number
    professional?: number
    justification?: string
  }
  scores_synthetic?: {
    overall?: number
    value?: number
    features?: number
    reliability?: number
  }
}

export interface ReviewResponse {
  success: boolean
  product: {
    path: string
    title: string
  }
  review: TLDRReview | null
  meta?: APIMeta
}

export interface APIResponse<T> {
  success: boolean
  data: T
  meta?: APIMeta
  message?: string

  // Convenience getters
  get credits_used(): number
  get credits_remaining(): number
}

// Helper to safely add a getter property (skips if already exists)
function safeDefineGetter(obj: any, prop: string, getter: () => any) {
  if (!(prop in obj)) {
    try {
      Object.defineProperty(obj, prop, { get: getter, enumerable: false, configurable: true })
    } catch {
      // Property already exists or object is frozen - skip silently
    }
  }
}

// Helper to add convenience properties to objects
function addProductAliases(product: any): ProductDetails {
  if (!product) return product
  safeDefineGetter(product, 'name', function(this: any) { return this.title })
  safeDefineGetter(product, 'product_id', function(this: any) { return this.shopsavvy })
  safeDefineGetter(product, 'asin', function(this: any) { return this.amazon })
  safeDefineGetter(product, 'image_url', function(this: any) { return this.images?.[0] })
  return product
}

function addOfferAliases<T extends Offer>(offer: T): T {
  if (!offer) return offer
  safeDefineGetter(offer, 'offer_id', function(this: any) { return this.id })
  safeDefineGetter(offer, 'url', function(this: any) { return this.URL })
  safeDefineGetter(offer, 'last_updated', function(this: any) { return this.timestamp })
  return offer
}

function addUsageAliases(usage: any): UsageInfo {
  if (!usage) return usage
  safeDefineGetter(usage, 'credits_used', function(this: any) { return this.current_period?.credits_used ?? 0 })
  safeDefineGetter(usage, 'credits_remaining', function(this: any) { return this.current_period?.credits_remaining ?? 0 })
  safeDefineGetter(usage, 'credits_total', function(this: any) { return this.current_period?.credits_limit ?? 0 })
  safeDefineGetter(usage, 'billing_period_start', function(this: any) { return this.current_period?.start_date })
  safeDefineGetter(usage, 'billing_period_end', function(this: any) { return this.current_period?.end_date })
  return usage
}

function addResponseAliases<T>(response: any): APIResponse<T> {
  safeDefineGetter(response, 'credits_used', function(this: any) { return this.meta?.credits_used ?? 0 })
  safeDefineGetter(response, 'credits_remaining', function(this: any) { return this.meta?.credits_remaining ?? 0 })
  return response
}

export class ShopSavvyDataAPI {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly timeout: number

  constructor(config: ShopSavvyConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://api.shopsavvy.com/v1'
    this.timeout = config.timeout || 30000

    if (!this.apiKey) {
      throw new Error('API key is required. Get one at https://shopsavvy.com/data')
    }

    if (!this.apiKey.match(/^ss_(live|test)_[a-zA-Z0-9]+$/)) {
      throw new Error('Invalid API key format. API keys should start with ss_live_ or ss_test_')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ShopSavvy-TypeScript-SDK/1.0.2',
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return addResponseAliases(data)
    } catch (error) {
      clearTimeout(timeoutId)

      if ((error as Error).name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`)
      }

      throw error
    }
  }

  /**
   * Search for products by keyword
   *
   * @param query Search query or keyword (e.g., "iphone 15 pro", "samsung tv")
   * @param options Optional parameters for pagination
   * @returns Search results with pagination info
   *
   * @example
   * ```typescript
   * const results = await api.searchProducts('iphone 15 pro', { limit: 10 })
   * results.data.forEach(product => console.log(product.title))
   * ```
   */
  async searchProducts(
    query: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<ProductSearchResult> {
    const params = new URLSearchParams({
      q: query,
      ...(options.limit && { limit: options.limit.toString() }),
      ...(options.offset && { offset: options.offset.toString() }),
    })

    const response = await this.request<ProductDetails[]>(`/products/search?${params}`) as any

    // Add aliases to each product
    if (response.data) {
      response.data = response.data.map(addProductAliases)
    }

    return addResponseAliases(response) as ProductSearchResult
  }

  /**
   * Look up product details by identifier
   *
   * @param identifier Product identifier (barcode, ASIN, URL, model number, product name, or ShopSavvy product ID)
   * @param options Optional parameters
   * @returns Product details (as array, even for single identifier)
   *
   * @example
   * ```typescript
   * // By barcode
   * const result = await api.getProductDetails('012345678901')
   * console.log(result.data[0].title)
   *
   * // By product name
   * const result2 = await api.getProductDetails('iPhone 15 Pro')
   * console.log(result2.data[0].name) // alias for title
   * ```
   */
  async getProductDetails(identifier: string, options: { format?: 'json' | 'csv' } = {}): Promise<APIResponse<ProductDetails[]>> {
    const params = new URLSearchParams({
      ids: identifier,
      ...(options.format && { format: options.format }),
    })

    const response = await this.request<ProductDetails[]>(`/products?${params}`)

    // Add aliases to each product
    if (response.data) {
      response.data = response.data.map(addProductAliases)
    }

    return response
  }

  /**
   * Look up details for multiple products
   *
   * @param identifiers Array of product identifiers
   * @param options Optional parameters
   * @returns Array of product details
   *
   * @example
   * ```typescript
   * const products = await api.getProductDetailsBatch(['012345678901', 'B08N5WRWNW'])
   * ```
   */
  async getProductDetailsBatch(identifiers: string[], options: { format?: 'json' | 'csv' } = {}): Promise<APIResponse<ProductDetails[]>> {
    const params = new URLSearchParams({
      ids: identifiers.join(','),
      ...(options.format && { format: options.format }),
    })

    const response = await this.request<ProductDetails[]>(`/products?${params}`)

    // Add aliases to each product
    if (response.data) {
      response.data = response.data.map(addProductAliases)
    }

    return response
  }

  /**
   * Get current offers for a product
   *
   * @param identifier Product identifier (barcode, ASIN, URL, model number, product name, or ShopSavvy product ID)
   * @param options Optional parameters
   * @returns Products with their current offers
   *
   * @example
   * ```typescript
   * const result = await api.getCurrentOffers('012345678901')
   * result.data.forEach(product => {
   *   console.log(`Product: ${product.title}`)
   *   product.offers.forEach(offer => console.log(`  ${offer.retailer}: $${offer.price}`))
   * })
   * ```
   */
  async getCurrentOffers(
    identifier: string,
    options: { retailer?: string; format?: 'json' | 'csv' } = {}
  ): Promise<APIResponse<ProductWithOffers[]>> {
    const params = new URLSearchParams({
      ids: identifier,
      ...(options.retailer && { retailer: options.retailer }),
      ...(options.format && { format: options.format }),
    })

    const response = await this.request<ProductWithOffers[]>(`/products/offers?${params}`)

    // Add aliases to each product and offer
    if (response.data) {
      response.data = response.data.map(product => {
        addProductAliases(product)
        if (product.offers) {
          product.offers = product.offers.map(addOfferAliases)
        }
        return product
      })
    }

    return response
  }

  /**
   * Get current offers for multiple products
   *
   * @param identifiers Array of product identifiers
   * @param options Optional parameters
   * @returns Current offers for all products
   */
  async getCurrentOffersBatch(
    identifiers: string[],
    options: { retailer?: string; format?: 'json' | 'csv' } = {}
  ): Promise<APIResponse<ProductWithOffers[]>> {
    const params = new URLSearchParams({
      ids: identifiers.join(','),
      ...(options.retailer && { retailer: options.retailer }),
      ...(options.format && { format: options.format }),
    })

    const response = await this.request<ProductWithOffers[]>(`/products/offers?${params}`)

    // Add aliases to each product and offer
    if (response.data) {
      response.data = response.data.map(product => {
        addProductAliases(product)
        if (product.offers) {
          product.offers = product.offers.map(addOfferAliases)
        }
        return product
      })
    }

    return response
  }

  /**
   * Get price history for a product
   *
   * @param identifier Product identifier
   * @param startDate Start date (YYYY-MM-DD format)
   * @param endDate End date (YYYY-MM-DD format)
   * @param options Optional parameters
   * @returns Offers with price history
   *
   * @example
   * ```typescript
   * const history = await api.getPriceHistory('012345678901', '2024-01-01', '2024-01-31')
   * ```
   */
  async getPriceHistory(
    identifier: string,
    startDate: string,
    endDate: string,
    options: { retailer?: string; format?: 'json' | 'csv' } = {}
  ): Promise<APIResponse<OfferWithHistory[]>> {
    const params = new URLSearchParams({
      ids: identifier,
      start_date: startDate,
      end_date: endDate,
      ...(options.retailer && { retailer: options.retailer }),
      ...(options.format && { format: options.format }),
    })

    const response = await this.request<OfferWithHistory[]>(`/products/offers/history?${params}`)

    // Add aliases to each offer
    if (response.data) {
      response.data = response.data.map(addOfferAliases)
    }

    return response
  }

  /**
   * Schedule product monitoring
   *
   * @param identifier Product identifier
   * @param frequency How often to refresh ('hourly', 'daily', 'weekly')
   * @param options Optional parameters
   * @returns Scheduling confirmation
   *
   * @example
   * ```typescript
   * await api.scheduleProductMonitoring('012345678901', 'daily')
   * ```
   */
  async scheduleProductMonitoring(
    identifier: string,
    frequency: 'hourly' | 'daily' | 'weekly',
    options: { retailer?: string } = {}
  ): Promise<APIResponse<{ scheduled: boolean; product_id: string }>> {
    return this.request(`/products/schedule`, {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        frequency,
        ...(options.retailer && { retailer: options.retailer }),
      }),
    })
  }

  /**
   * Schedule monitoring for multiple products
   *
   * @param identifiers Array of product identifiers
   * @param frequency How often to refresh
   * @param options Optional parameters
   * @returns Scheduling confirmation for all products
   */
  async scheduleProductMonitoringBatch(
    identifiers: string[],
    frequency: 'hourly' | 'daily' | 'weekly',
    options: { retailer?: string } = {}
  ): Promise<APIResponse<Array<{ identifier: string; scheduled: boolean; product_id: string }>>> {
    return this.request(`/products/schedule`, {
      method: 'POST',
      body: JSON.stringify({
        identifiers: identifiers.join(','),
        frequency,
        ...(options.retailer && { retailer: options.retailer }),
      }),
    })
  }

  /**
   * Get all scheduled products
   *
   * @returns List of scheduled products
   *
   * @example
   * ```typescript
   * const scheduled = await api.getScheduledProducts()
   * console.log(`Monitoring ${scheduled.data.length} products`)
   * ```
   */
  async getScheduledProducts(): Promise<APIResponse<ScheduledProduct[]>> {
    return this.request<ScheduledProduct[]>('/products/scheduled')
  }

  /**
   * Remove products from monitoring schedule
   *
   * @param identifier Product identifier to remove
   * @returns Removal confirmation
   *
   * @example
   * ```typescript
   * await api.removeProductFromSchedule('012345678901')
   * ```
   */
  async removeProductFromSchedule(identifier: string): Promise<APIResponse<{ removed: boolean }>> {
    return this.request(`/products/schedule`, {
      method: 'DELETE',
      body: JSON.stringify({ identifier }),
    })
  }

  /**
   * Remove multiple products from monitoring schedule
   *
   * @param identifiers Array of product identifiers to remove
   * @returns Removal confirmation for all products
   */
  async removeProductsFromSchedule(identifiers: string[]): Promise<APIResponse<Array<{ identifier: string; removed: boolean }>>> {
    return this.request(`/products/schedule`, {
      method: 'DELETE',
      body: JSON.stringify({ identifiers: identifiers.join(',') }),
    })
  }

  /**
   * Browse current shopping deals with sorting, filtering, and pagination
   *
   * @param options Optional filters and pagination
   * @returns List of deals with grades, pricing, and community votes
   *
   * @example
   * ```typescript
   * const deals = await api.getDeals({ sort: 'hot', limit: 10, grade: 'B' })
   * for (const deal of deals.deals) {
   *   console.log(`${deal.grade.letter}${deal.grade.suffix || ''} ${deal.title} - $${deal.pricing.current}`)
   * }
   * ```
   */
  async getDeals(options?: {
    sort?: 'hot' | 'new' | 'top-hour' | 'top-day' | 'top-week'
    limit?: number
    offset?: number
    category?: string
    retailer?: string
    tag?: string
    min_price?: number
    max_price?: number
    grade?: string
    format?: 'json' | 'csv'
  }): Promise<DealsResponse> {
    const params = new URLSearchParams()
    if (options) {
      for (const [key, value] of Object.entries(options)) {
        if (value !== undefined) params.set(key, String(value))
      }
    }
    const query = params.toString()
    return this.request(`/deals${query ? `?${query}` : ''}`)
  }

  /**
   * Get TLDR review for a product (pros, cons, bottom line, scores)
   *
   * @param identifier Product identifier (barcode, ASIN, URL, model number)
   * @returns Expert review summary or null if no review exists
   *
   * @example
   * ```typescript
   * const result = await api.getProductReview('B09XS7JWHH')
   * if (result.review) {
   *   console.log('Pros:', result.review.pros.join(', '))
   *   console.log('Cons:', result.review.cons.join(', '))
   *   console.log('Score:', result.review.scores?.overall)
   * }
   * ```
   */
  async getProductReview(identifier: string): Promise<ReviewResponse> {
    return this.request(`/products/reviews?id=${encodeURIComponent(identifier)}`)
  }

  /**
   * Get API usage information
   *
   * @returns Current usage and credit information
   *
   * @example
   * ```typescript
   * const usage = await api.getUsage()
   * console.log(`Credits remaining: ${usage.data.credits_remaining}`)
   * ```
   */
  async getUsage(): Promise<APIResponse<UsageInfo>> {
    const response = await this.request<UsageInfo>('/usage')

    // Add aliases to usage info
    if (response.data) {
      addUsageAliases(response.data)
    }

    return response
  }
}

/**
 * Create a new ShopSavvy Data API client
 *
 * @param config Configuration object with API key and optional settings
 * @returns API client instance
 *
 * @example
 * ```typescript
 * import { createShopSavvyClient } from '@shopsavvy/data-api'
 *
 * const api = createShopSavvyClient({
 *   apiKey: 'ss_live_your_api_key_here'
 * })
 *
 * const product = await api.getProductDetails('012345678901')
 * console.log(product.data[0].title)
 * ```
 */
export function createShopSavvyClient(config: ShopSavvyConfig): ShopSavvyDataAPI {
  return new ShopSavvyDataAPI(config)
}

// Export the main class as default
export default ShopSavvyDataAPI
