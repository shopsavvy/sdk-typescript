// src/index.ts
var ShopSavvyDataAPI = class {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.shopsavvy.com/v1";
    this.timeout = config.timeout || 3e4;
    if (!this.apiKey) {
      throw new Error("API key is required. Get one at https://shopsavvy.com/data");
    }
    if (!this.apiKey.match(/^ss_(live|test)_[a-zA-Z0-9]+$/)) {
      throw new Error("Invalid API key format. API keys should start with ss_live_ or ss_test_");
    }
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "ShopSavvy-TypeScript-SDK/1.0.0",
          ...options.headers
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
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
  async getProductDetails(identifier, options = {}) {
    const params = new URLSearchParams({
      identifier,
      ...options.format && { format: options.format }
    });
    return this.request(`/products/details?${params}`);
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
  async getProductDetailsBatch(identifiers, options = {}) {
    const params = new URLSearchParams({
      identifiers: identifiers.join(","),
      ...options.format && { format: options.format }
    });
    return this.request(`/products/details?${params}`);
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
  async getCurrentOffers(identifier, options = {}) {
    const params = new URLSearchParams({
      identifier,
      ...options.retailer && { retailer: options.retailer },
      ...options.format && { format: options.format }
    });
    return this.request(`/products/offers?${params}`);
  }
  /**
   * Get current offers for multiple products
   * 
   * @param identifiers Array of product identifiers
   * @param options Optional parameters
   * @returns Current offers for all products
   */
  async getCurrentOffersBatch(identifiers, options = {}) {
    const params = new URLSearchParams({
      identifiers: identifiers.join(","),
      ...options.retailer && { retailer: options.retailer },
      ...options.format && { format: options.format }
    });
    return this.request(`/products/offers?${params}`);
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
  async getPriceHistory(identifier, startDate, endDate, options = {}) {
    const params = new URLSearchParams({
      identifier,
      start_date: startDate,
      end_date: endDate,
      ...options.retailer && { retailer: options.retailer },
      ...options.format && { format: options.format }
    });
    return this.request(`/products/history?${params}`);
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
  async scheduleProductMonitoring(identifier, frequency, options = {}) {
    return this.request(`/products/schedule`, {
      method: "POST",
      body: JSON.stringify({
        identifier,
        frequency,
        ...options.retailer && { retailer: options.retailer }
      })
    });
  }
  /**
   * Schedule monitoring for multiple products
   * 
   * @param identifiers Array of product identifiers
   * @param frequency How often to refresh
   * @param options Optional parameters
   * @returns Scheduling confirmation for all products
   */
  async scheduleProductMonitoringBatch(identifiers, frequency, options = {}) {
    return this.request(`/products/schedule`, {
      method: "POST",
      body: JSON.stringify({
        identifiers: identifiers.join(","),
        frequency,
        ...options.retailer && { retailer: options.retailer }
      })
    });
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
  async getScheduledProducts() {
    return this.request("/products/scheduled");
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
  async removeProductFromSchedule(identifier) {
    return this.request(`/products/schedule`, {
      method: "DELETE",
      body: JSON.stringify({ identifier })
    });
  }
  /**
   * Remove multiple products from monitoring schedule
   * 
   * @param identifiers Array of product identifiers to remove
   * @returns Removal confirmation for all products
   */
  async removeProductsFromSchedule(identifiers) {
    return this.request(`/products/schedule`, {
      method: "DELETE",
      body: JSON.stringify({ identifiers: identifiers.join(",") })
    });
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
  async getUsage() {
    return this.request("/usage");
  }
};
function createShopSavvyClient(config) {
  return new ShopSavvyDataAPI(config);
}
var index_default = ShopSavvyDataAPI;
export {
  ShopSavvyDataAPI,
  createShopSavvyClient,
  index_default as default
};
