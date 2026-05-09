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
/**
 * API response metadata containing credit usage info
 */
interface APIMeta {
    credits_used: number;
    credits_remaining: number;
    rate_limit_remaining?: number;
}
/**
 * Product details from ShopSavvy API
 */
interface ProductDetails {
    /** Product title */
    title: string;
    /** ShopSavvy product ID */
    shopsavvy: string;
    /** Product brand */
    brand?: string;
    /** Product category */
    category?: string;
    /** Product image URLs */
    images?: string[];
    /** Product barcode */
    barcode?: string;
    /** Amazon ASIN */
    amazon?: string;
    /** Product model number */
    model?: string;
    /** Manufacturer part number */
    mpn?: string;
    /** Product color */
    color?: string;
    /** Shortened human-friendly title */
    title_short?: string;
    /** URL-friendly slug */
    slug?: string;
    /** Product description text */
    description?: string;
    /** Array of category paths */
    categories?: string[];
    /** Product specifications (flat key-value) */
    attributes?: Record<string, string>;
    /** Aggregated customer rating */
    rating?: {
        value: number;
        count: number;
    };
    /** Expert quality scores (0-100 scale) */
    score?: {
        overall?: number;
        customer?: number;
        professional?: number;
        value?: number;
        features?: number;
        reliability?: number;
    };
    /** Relevant search keywords */
    keywords?: string[];
    /** All known product identifiers */
    identifiers?: Record<string, string | number>;
    /** @deprecated Use `title` instead */
    get name(): string;
    /** @deprecated Use `shopsavvy` instead */
    get product_id(): string;
    /** @deprecated Use `amazon` instead */
    get asin(): string | undefined;
    /** @deprecated Use `images[0]` instead */
    get image_url(): string | undefined;
}
/**
 * Product with nested offers (returned by offers endpoint)
 */
interface ProductWithOffers extends ProductDetails {
    offers: Offer[];
}
/**
 * Product offer from a retailer
 */
interface Offer {
    /** Unique offer identifier */
    id: string;
    /** Retailer name */
    retailer?: string;
    /** Offer price */
    price?: number;
    /** Price currency */
    currency?: string;
    /** Product availability */
    availability?: string;
    /** Product condition */
    condition?: string;
    /** Link to product page */
    URL?: string;
    /** Marketplace seller name */
    seller?: string;
    /** Last update timestamp */
    timestamp?: string;
    /** Price history */
    history?: Array<{
        date: string;
        price: number;
        availability: string;
    }>;
    /** @deprecated Use `id` instead */
    get offer_id(): string;
    /** @deprecated Use `URL` instead */
    get url(): string | undefined;
    /** @deprecated Use `timestamp` instead */
    get last_updated(): string | undefined;
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
/**
 * Current billing period details
 */
interface UsagePeriod {
    start_date: string;
    end_date: string;
    credits_used: number;
    credits_limit: number;
    credits_remaining: number;
    requests_made: number;
}
/**
 * API usage information
 */
interface UsageInfo {
    current_period: UsagePeriod;
    usage_percentage: number;
    /** @deprecated Use `current_period.credits_used` instead */
    get credits_used(): number;
    /** @deprecated Use `current_period.credits_remaining` instead */
    get credits_remaining(): number;
    /** @deprecated Use `current_period.credits_limit` instead */
    get credits_total(): number;
    /** @deprecated Use `current_period.start_date` instead */
    get billing_period_start(): string;
    /** @deprecated Use `current_period.end_date` instead */
    get billing_period_end(): string;
}
interface PaginationInfo {
    total: number;
    limit: number;
    offset: number;
    returned: number;
}
interface ProductSearchResult {
    success: boolean;
    data: ProductDetails[];
    pagination: PaginationInfo;
    meta?: APIMeta;
    get credits_used(): number;
    get credits_remaining(): number;
}
/**
 * A shopping deal with expert grading
 */
interface Deal {
    path: string;
    title: string;
    subtitle?: string;
    description?: string;
    emoji?: string;
    grade: {
        letter: string;
        suffix?: string;
        value: number;
        justification?: string;
    };
    pricing: {
        current: number;
        original?: number;
        currency: string;
    };
    retailer: {
        name: string;
    };
    product?: string;
    url: string;
    image?: {
        url: string;
    };
    votes: {
        upvotes: number;
        downvotes: number;
        score: number;
    };
    comment_count: number;
    tags?: {
        slug: string;
        display: string;
    }[];
    product_scores?: Record<string, number>;
    expires_at?: string;
    created_at: string;
}
interface DealsResponse {
    success: boolean;
    deals: Deal[];
    pagination: {
        total: number;
        has_more: boolean;
        limit: number;
        offset: number;
    };
    meta?: APIMeta;
}
/**
 * A TLDR product review with expert scores
 */
interface TLDRReview {
    slug: string;
    headline: string;
    pros: string[];
    cons: string[];
    bottom_line: string;
    scores?: {
        overall?: number;
        customer?: number;
        professional?: number;
        value?: number;
        features?: number;
        reliability?: number;
    };
}
interface ReviewResponse {
    success: boolean;
    product: {
        path: string;
        title: string;
    };
    review: TLDRReview | null;
    meta?: APIMeta;
}
interface BatchResult {
    identifier: string;
    status: 'found' | 'not_found';
    product: ProductDetails | null;
    offers?: Offer[];
    review?: TLDRReview | null;
}
interface BatchResponse {
    success: boolean;
    results?: BatchResult[];
    summary?: {
        total: number;
        found: number;
        not_found: number;
    };
    batch?: {
        id: string;
        status: string;
        total: number;
        processed: number;
        poll_url: string;
    };
    meta?: APIMeta;
}
interface APIResponse<T> {
    success: boolean;
    data: T;
    meta?: APIMeta;
    message?: string;
    get credits_used(): number;
    get credits_remaining(): number;
}
declare class ShopSavvyDataAPI {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeout;
    constructor(config: ShopSavvyConfig);
    private request;
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
    searchProducts(query: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<ProductSearchResult>;
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
    getProductDetails(identifier: string, options?: {
        format?: 'json' | 'csv';
    }): Promise<APIResponse<ProductDetails[]>>;
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
    getCurrentOffers(identifier: string, options?: {
        retailer?: string;
        format?: 'json' | 'csv';
    }): Promise<APIResponse<ProductWithOffers[]>>;
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
    }): Promise<APIResponse<ProductWithOffers[]>>;
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
    getDeals(options?: {
        sort?: 'hot' | 'new' | 'top-hour' | 'top-day' | 'top-week';
        limit?: number;
        offset?: number;
        category?: string;
        retailer?: string;
        tag?: string;
        min_price?: number;
        max_price?: number;
        grade?: string;
        format?: 'json' | 'csv';
    }): Promise<DealsResponse>;
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
    getProductReview(identifier: string): Promise<ReviewResponse>;
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
    batchLookup(identifiers: string[], options?: {
        include?: ('offers' | 'reviews')[];
    }): Promise<BatchResponse>;
    /**
     * Poll for async batch job results
     *
     * @param batchId The batch job ID from a previous batchLookup call
     * @returns Current batch status and results when complete
     */
    getBatchStatus(batchId: string): Promise<BatchResponse>;
    /** Create a webhook to receive event notifications */
    createWebhook(url: string, events: ('price_drop' | 'availability_change' | 'schedule_completion')[]): Promise<any>;
    /** List all webhooks for your account */
    listWebhooks(): Promise<any>;
    /** Send a test event to a webhook */
    testWebhook(webhookId: string): Promise<any>;
    /** Delete a webhook */
    deleteWebhook(webhookId: string): Promise<any>;
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
 * console.log(product.data[0].title)
 * ```
 */
declare function createShopSavvyClient(config: ShopSavvyConfig): ShopSavvyDataAPI;

export { type APIMeta, type APIResponse, type BatchResponse, type BatchResult, type Deal, type DealsResponse, type Offer, type OfferWithHistory, type PaginationInfo, type PriceHistoryEntry, type ProductDetails, type ProductSearchResult, type ProductWithOffers, type ReviewResponse, type ScheduledProduct, type ShopSavvyConfig, ShopSavvyDataAPI, type TLDRReview, type UsageInfo, type UsagePeriod, createShopSavvyClient, ShopSavvyDataAPI as default };
