/**
 * Official TypeScript/JavaScript SDK for ShopSavvy Data API
 *
 * This SDK provides a convenient interface to interact with the ShopSavvy Data API,
 * allowing you to access product data, pricing information, and price history
 * across thousands of retailers and millions of products.
 *
 * @see https://shopsavvy.com/data
 */
interface ShopSavvyConfig {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
}
interface ProductDetails {
    product_id: string;
    name: string;
    brand?: string;
    category?: string;
    image_url?: string;
    barcode?: string;
    asin?: string;
    model?: string;
    mpn?: string;
    description?: string;
    identifiers?: Record<string, string>;
}
interface Offer {
    offer_id: string;
    retailer: string;
    price: number;
    currency: string;
    availability: 'in_stock' | 'out_of_stock' | 'limited_stock';
    condition: 'new' | 'used' | 'refurbished';
    url: string;
    shipping?: number;
    last_updated: string;
}
interface PriceHistoryEntry {
    date: string;
    price: number;
    availability: string;
}
interface OfferWithHistory extends Offer {
    price_history: PriceHistoryEntry[];
}
interface ScheduledProduct {
    product_id: string;
    identifier: string;
    frequency: 'hourly' | 'daily' | 'weekly';
    retailer?: string;
    created_at: string;
    last_refreshed?: string;
}
interface UsageInfo {
    credits_used: number;
    credits_remaining: number;
    credits_total: number;
    billing_period_start: string;
    billing_period_end: string;
    plan_name: string;
}
interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    credits_used?: number;
    credits_remaining?: number;
}
declare class ShopSavvyDataAPI {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeout;
    constructor(config: ShopSavvyConfig);
    private request;
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
    getProductDetails(identifier: string, options?: {
        format?: 'json' | 'csv';
    }): Promise<APIResponse<ProductDetails>>;
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
    getProductDetailsBatch(identifiers: string[], options?: {
        format?: 'json' | 'csv';
    }): Promise<APIResponse<ProductDetails[]>>;
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
    getCurrentOffers(identifier: string, options?: {
        retailer?: string;
        format?: 'json' | 'csv';
    }): Promise<APIResponse<Offer[]>>;
    /**
     * Get current offers for multiple products
     *
     * @param identifiers Array of product identifiers
     * @param options Optional parameters
     * @returns Current offers for all products
     */
    getCurrentOffersBatch(identifiers: string[], options?: {
        retailer?: string;
        format?: 'json' | 'csv';
    }): Promise<APIResponse<Record<string, Offer[]>>>;
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
    getPriceHistory(identifier: string, startDate: string, endDate: string, options?: {
        retailer?: string;
        format?: 'json' | 'csv';
    }): Promise<APIResponse<OfferWithHistory[]>>;
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
    scheduleProductMonitoring(identifier: string, frequency: 'hourly' | 'daily' | 'weekly', options?: {
        retailer?: string;
    }): Promise<APIResponse<{
        scheduled: boolean;
        product_id: string;
    }>>;
    /**
     * Schedule monitoring for multiple products
     *
     * @param identifiers Array of product identifiers
     * @param frequency How often to refresh
     * @param options Optional parameters
     * @returns Scheduling confirmation for all products
     */
    scheduleProductMonitoringBatch(identifiers: string[], frequency: 'hourly' | 'daily' | 'weekly', options?: {
        retailer?: string;
    }): Promise<APIResponse<Array<{
        identifier: string;
        scheduled: boolean;
        product_id: string;
    }>>>;
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
    getScheduledProducts(): Promise<APIResponse<ScheduledProduct[]>>;
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
    removeProductFromSchedule(identifier: string): Promise<APIResponse<{
        removed: boolean;
    }>>;
    /**
     * Remove multiple products from monitoring schedule
     *
     * @param identifiers Array of product identifiers to remove
     * @returns Removal confirmation for all products
     */
    removeProductsFromSchedule(identifiers: string[]): Promise<APIResponse<Array<{
        identifier: string;
        removed: boolean;
    }>>>;
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
    getUsage(): Promise<APIResponse<UsageInfo>>;
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
declare function createShopSavvyClient(config: ShopSavvyConfig): ShopSavvyDataAPI;

export { type APIResponse, type Offer, type OfferWithHistory, type PriceHistoryEntry, type ProductDetails, type ScheduledProduct, type ShopSavvyConfig, ShopSavvyDataAPI, type UsageInfo, createShopSavvyClient, ShopSavvyDataAPI as default };
