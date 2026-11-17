# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 1.6.0 - 2026-11-17

### Added
- Every API error is now thrown as a typed `APIError` (subclasses `AuthenticationError`, `NotFoundError`, `ValidationError`, `RateLimitError`, `CreditsExhaustedError`). Each carries `statusCode`, `code`, `action`, `docsUrl`, `requestId` and `retryAfterSeconds` (parsed from the `Retry-After` header), read from the API's `error_detail` object. `message` text is unchanged.
- `CreditsExhaustedError` for `ERR_CREDITS_EXHAUSTED`.
- README section "Errors, rate limits and credits".

### Changed
- Credits exhausted (`ERR_CREDITS_EXHAUSTED`, HTTP 429) is no longer reported as a rate-limit error. Code that retried every 429 should retry only `RateLimitError` and stop on `CreditsExhaustedError`. A 429 without a code (older server) is still a `RateLimitError`.
- Non-2xx responses used to throw a plain `Error`; they now throw `APIError` (still an `Error` subclass, same message).
- README quick start reads the key from `SHOPSAVVY_API_KEY` and prints the cheapest offer for a real barcode; removed the "free account" and "most comprehensive" copy.

## 1.5.0 - 2026-11-09

### Added
- `in_store_prices` (user-collected receipt prices) on current offers and batch results.

## 1.4.0 - 2026-09-27

### Fixed
- `getPriceHistory` returns one entry per product, each with offers carrying `history`.
- `scheduleProductMonitoring` / unschedule send query parameters to `/products/scheduled`; schedule, unschedule and list response types match the API.

## 1.1.0 - 2026-03-29

### Added
- Deals and reviews endpoints and expanded product types. Later additions before 1.4.0: batch lookup and batch status, webhook management (create, list, test, delete, update), currency on price-history points.

## Initial release - 2025-07-30

- First public version of the SDK.
