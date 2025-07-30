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

export interface ProductDetails {
  product_id: string
  name: string
  brand?: string
  category?: string
  image_url?: string
  barcode?: string
  asin?: string
  model?: string
  mpn?: string
  description?: string
  identifiers?: Record<string, string>
}

export interface Offer {
  offer_id: string
  retailer: string
  price: number
  currency: string
  availability: 'in_stock' | 'out_of_stock' | 'limited_stock'
  condition: 'new' | 'used' | 'refurbished'
  url: string
  shipping?: number
  last_updated: string
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

export interface UsageInfo {
  credits_used: number
  credits_remaining: number
  credits_total: number
  billing_period_start: string
  billing_period_end: string
  plan_name: string
}

export interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  credits_used?: number
  credits_remaining?: number
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
          'User-Agent': 'ShopSavvy-TypeScript-SDK/1.0.0',
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)
      
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`)
      }
      
      throw error
    }
  }

  /**
   * Look up product details by identifier
   * 
   * @param identifier Product identifier (barcode, ASIN, URL, model number, or ShopSavvy product ID)
   * @param options Optional parameters
   * @returns Product details
   * 
   * @example
   * ```typescript
   * const product = await api.getProductDetails('012345678901')
   * console.log(product.name)
   * ```
   */
  async getProductDetails(identifier: string, options: { format?: 'json' | 'csv' } = {}): Promise<APIResponse<ProductDetails>> {
    const params = new URLSearchParams({
      identifier,
      ...(options.format && { format: options.format }),
    })

    return this.request<ProductDetails>(`/products/details?${params}`)
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
      identifiers: identifiers.join(','),
      ...(options.format && { format: options.format }),
    })

    return this.request<ProductDetails[]>(`/products/details?${params}`)
  }

  /**
   * Get current offers for a product
   * 
   * @param identifier Product identifier
   * @param options Optional parameters
   * @returns Current offers
   * 
   * @example
   * ```typescript
   * const offers = await api.getCurrentOffers('012345678901')
   * offers.data.forEach(offer => console.log(`${offer.retailer}: $${offer.price}`))
   * ```
   */
  async getCurrentOffers(
    identifier: string, 
    options: { retailer?: string; format?: 'json' | 'csv' } = {}
  ): Promise<APIResponse<Offer[]>> {
    const params = new URLSearchParams({
      identifier,
      ...(options.retailer && { retailer: options.retailer }),
      ...(options.format && { format: options.format }),
    })

    return this.request<Offer[]>(`/products/offers?${params}`)
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
  ): Promise<APIResponse<Record<string, Offer[]>>> {
    const params = new URLSearchParams({
      identifiers: identifiers.join(','),
      ...(options.retailer && { retailer: options.retailer }),
      ...(options.format && { format: options.format }),
    })

    return this.request<Record<string, Offer[]>>(`/products/offers?${params}`)
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
      identifier,
      start_date: startDate,
      end_date: endDate,
      ...(options.retailer && { retailer: options.retailer }),
      ...(options.format && { format: options.format }),
    })

    return this.request<OfferWithHistory[]>(`/products/history?${params}`)
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
    return this.request<UsageInfo>('/usage')
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
 * console.log(product.data.name)
 * ```
 */
export function createShopSavvyClient(config: ShopSavvyConfig): ShopSavvyDataAPI {
  return new ShopSavvyDataAPI(config)
}

// Export the main class as default
export default ShopSavvyDataAPI

