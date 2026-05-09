"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ShopSavvyDataAPI: () => ShopSavvyDataAPI,
  createShopSavvyClient: () => createShopSavvyClient,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
function safeDefineGetter(obj, prop, getter) {
  if (!(prop in obj)) {
    try {
      Object.defineProperty(obj, prop, { get: getter, enumerable: false, configurable: true });
    } catch {
    }
  }
}
function addProductAliases(product) {
  if (!product) return product;
  safeDefineGetter(product, "name", function() {
    return this.title;
  });
  safeDefineGetter(product, "product_id", function() {
    return this.shopsavvy;
  });
  safeDefineGetter(product, "asin", function() {
    return this.amazon;
  });
  safeDefineGetter(product, "image_url", function() {
    return this.images?.[0];
  });
  return product;
}
function addOfferAliases(offer) {
  if (!offer) return offer;
  safeDefineGetter(offer, "offer_id", function() {
    return this.id;
  });
  safeDefineGetter(offer, "url", function() {
    return this.URL;
  });
  safeDefineGetter(offer, "last_updated", function() {
    return this.timestamp;
  });
  return offer;
}
function addUsageAliases(usage) {
  if (!usage) return usage;
  safeDefineGetter(usage, "credits_used", function() {
    return this.current_period?.credits_used ?? 0;
  });
  safeDefineGetter(usage, "credits_remaining", function() {
    return this.current_period?.credits_remaining ?? 0;
  });
  safeDefineGetter(usage, "credits_total", function() {
    return this.current_period?.credits_limit ?? 0;
  });
  safeDefineGetter(usage, "billing_period_start", function() {
    return this.current_period?.start_date;
  });
  safeDefineGetter(usage, "billing_period_end", function() {
    return this.current_period?.end_date;
  });
  return usage;
}
function addResponseAliases(response) {
  safeDefineGetter(response, "credits_used", function() {
    return this.meta?.credits_used ?? 0;
  });
  safeDefineGetter(response, "credits_remaining", function() {
    return this.meta?.credits_remaining ?? 0;
  });
  return response;
}
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
          "User-Agent": "ShopSavvy-TypeScript-SDK/1.0.2",
          ...options.headers
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return addResponseAliases(data);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
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
  async searchProducts(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      ...options.limit && { limit: options.limit.toString() },
      ...options.offset && { offset: options.offset.toString() }
    });
    const response = await this.request(`/products/search?${params}`);
    if (response.data) {
      response.data = response.data.map(addProductAliases);
    }
    return addResponseAliases(response);
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
  async getProductDetails(identifier, options = {}) {
    const params = new URLSearchParams({
      ids: identifier,
      ...options.format && { format: options.format }
    });
    const response = await this.request(`/products?${params}`);
    if (response.data) {
      response.data = response.data.map(addProductAliases);
    }
    return response;
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
      ids: identifiers.join(","),
      ...options.format && { format: options.format }
    });
    const response = await this.request(`/products?${params}`);
    if (response.data) {
      response.data = response.data.map(addProductAliases);
    }
    return response;
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
  async getCurrentOffers(identifier, options = {}) {
    const params = new URLSearchParams({
      ids: identifier,
      ...options.retailer && { retailer: options.retailer },
      ...options.format && { format: options.format }
    });
    const response = await this.request(`/products/offers?${params}`);
    if (response.data) {
      response.data = response.data.map((product) => {
        addProductAliases(product);
        if (product.offers) {
          product.offers = product.offers.map(addOfferAliases);
        }
        return product;
      });
    }
    return response;
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
      ids: identifiers.join(","),
      ...options.retailer && { retailer: options.retailer },
      ...options.format && { format: options.format }
    });
    const response = await this.request(`/products/offers?${params}`);
    if (response.data) {
      response.data = response.data.map((product) => {
        addProductAliases(product);
        if (product.offers) {
          product.offers = product.offers.map(addOfferAliases);
        }
        return product;
      });
    }
    return response;
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
      ids: identifier,
      start_date: startDate,
      end_date: endDate,
      ...options.retailer && { retailer: options.retailer },
      ...options.format && { format: options.format }
    });
    const response = await this.request(`/products/offers/history?${params}`);
    if (response.data) {
      response.data = response.data.map(addOfferAliases);
    }
    return response;
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
  async getDeals(options) {
    const params = new URLSearchParams();
    if (options) {
      for (const [key, value] of Object.entries(options)) {
        if (value !== void 0) params.set(key, String(value));
      }
    }
    const query = params.toString();
    return this.request(`/deals${query ? `?${query}` : ""}`);
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
  async getProductReview(identifier) {
    return this.request(`/products/reviews?id=${encodeURIComponent(identifier)}`);
  }
  /**
   * Look up multiple products at once
   *
   * @param identifiers Array of product identifiers (max 100)
   * @param options Optional: include offers and/or reviews alongside products
   * @returns Batch results (sync for <=20, async batch_id for >20)
   *
   * @example
   * ```typescript
   * const result = await api.batchLookup(['B09XS7JWHH', 'B0CHX3TW6K'], { include: ['offers'] })
   * for (const item of result.results ?? []) {
   *   if (item.status === 'found') console.log(item.product?.title)
   * }
   * ```
   */
  async batchLookup(identifiers, options) {
    return this.request("/products/batch", {
      method: "POST",
      body: JSON.stringify({ identifiers, include: options?.include })
    });
  }
  /**
   * Poll for async batch job results
   *
   * @param batchId The batch job ID from a previous batchLookup call
   * @returns Current batch status and results when complete
   */
  async getBatchStatus(batchId) {
    return this.request(`/batch/${batchId}`);
  }
  // ---- Webhooks ----
  /** Create a webhook to receive event notifications */
  async createWebhook(url, events) {
    return this.request("/webhooks", { method: "POST", body: JSON.stringify({ url, events }) });
  }
  /** List all webhooks for your account */
  async listWebhooks() {
    return this.request("/webhooks");
  }
  /** Send a test event to a webhook */
  async testWebhook(webhookId) {
    return this.request(`/webhooks/${webhookId}/test`, { method: "POST" });
  }
  /** Delete a webhook */
  async deleteWebhook(webhookId) {
    return this.request(`/webhooks/${webhookId}`, { method: "DELETE" });
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
    const response = await this.request("/usage");
    if (response.data) {
      addUsageAliases(response.data);
    }
    return response;
  }
};
function createShopSavvyClient(config) {
  return new ShopSavvyDataAPI(config);
}
var index_default = ShopSavvyDataAPI;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ShopSavvyDataAPI,
  createShopSavvyClient
});
