# Contributing to ShopSavvy TypeScript SDK

Thank you for your interest in contributing to the ShopSavvy TypeScript SDK! This document provides guidelines for contributing to this open-source project.

## Development Setup

### Prerequisites

- Node.js 16 or higher
- npm, yarn, or bun
- A ShopSavvy Data API key (get one at [https://shopsavvy.com/data](https://shopsavvy.com/data))

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/typescript-sdk
   cd typescript-sdk
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Project Structure

```
src/
├── index.ts          # Main SDK implementation
├── types.ts          # Type definitions (future)
├── utils.ts          # Utility functions (future)
└── __tests__/        # Test files (future)
    └── index.test.ts
```

### Building

```bash
# Build for development
npm run dev

# Build for production
npm run build

# Build and watch for changes
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## Code Guidelines

### TypeScript Standards

- Use TypeScript for all code
- Follow strict TypeScript settings
- Provide comprehensive type definitions
- Use JSDoc comments for all public methods
- Maintain 100% type coverage

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use meaningful variable and function names
- Keep functions focused and small
- Use async/await instead of promises

### API Design Principles

1. **Consistency**: All methods should follow the same patterns
2. **Type Safety**: Everything should be properly typed
3. **Error Handling**: All API calls should handle errors gracefully
4. **Documentation**: All public methods need comprehensive JSDoc
5. **Backwards Compatibility**: Don't break existing APIs without major version bump

### Example Code Style

```typescript
/**
 * Gets product details by identifier
 * 
 * @param identifier Product identifier (barcode, ASIN, URL, etc.)
 * @param options Optional parameters
 * @returns Promise resolving to product details
 * 
 * @example
 * ```typescript
 * const product = await api.getProductDetails('012345678901')
 * console.log(product.data.name)
 * ```
 */
async getProductDetails(
  identifier: string, 
  options: { format?: 'json' | 'csv' } = {}
): Promise<APIResponse<ProductDetails>> {
  const params = new URLSearchParams({
    identifier,
    ...(options.format && { format: options.format }),
  })

  return this.request<ProductDetails>(`/products/details?${params}`)
}
```

## Adding New Features

### Adding New API Methods

1. **Define types**: Add interfaces for request/response in the main file
2. **Implement method**: Follow existing patterns for consistency
3. **Add documentation**: Include JSDoc with examples
4. **Add tests**: Write comprehensive tests for the new method
5. **Update README**: Add examples and documentation

### Adding New Options

1. **Update interfaces**: Add new options to existing interfaces
2. **Maintain backwards compatibility**: Make new options optional
3. **Update documentation**: Document new options
4. **Add tests**: Test new functionality

## Testing

### Unit Tests

Write unit tests for all new functionality:

```typescript
import { createShopSavvyClient } from '../src/index'

describe('ShopSavvyDataAPI', () => {
  let api: ShopSavvyDataAPI

  beforeEach(() => {
    api = createShopSavvyClient({
      apiKey: 'ss_test_123456789'
    })
  })

  test('should get product details', async () => {
    // Mock the fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { product_id: '123', name: 'Test Product' }
        }),
      })
    ) as jest.Mock

    const result = await api.getProductDetails('012345678901')
    expect(result.data.name).toBe('Test Product')
  })
})
```

### Integration Tests

Test against the real API (use test API keys):

```typescript
describe('Integration Tests', () => {
  test('should work with real API', async () => {
    const api = createShopSavvyClient({
      apiKey: process.env.SHOPSAVVY_TEST_API_KEY!
    })

    const result = await api.getProductDetails('012345678901')
    expect(result.success).toBe(true)
  })
})
```

## Documentation

### README Updates

- Keep examples current and working
- Update API documentation for new features
- Ensure all links work
- Update version numbers

### JSDoc Standards

```typescript
/**
 * Brief description of what the method does
 * 
 * @param paramName Description of parameter
 * @param options Optional parameters with descriptions
 * @returns Description of return value
 * 
 * @throws {Error} When this error might occur
 * 
 * @example
 * ```typescript
 * // Example usage
 * const result = await api.method('parameter')
 * ```
 * 
 * @since 1.2.0
 */
```

## Submitting Changes

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests**
5. **Update documentation**
6. **Run all tests and linting**
   ```bash
   npm test
   npm run lint
   npm run build
   ```
7. **Submit a pull request**

### Pull Request Guidelines

- **Clear title**: Describe what the PR does
- **Detailed description**: Explain the changes and why they're needed
- **Breaking changes**: Clearly mark any breaking changes
- **Test coverage**: Ensure all new code is tested
- **Documentation**: Update relevant documentation

### Commit Messages

Use conventional commit format:

```
feat: add support for batch product lookups
fix: handle timeout errors properly
docs: update README with new examples
test: add integration tests for price history
refactor: improve error handling consistency
```

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Update documentation
4. Run full test suite
5. Build and verify package
6. Create git tag
7. Publish to npm
8. Create GitHub release

## Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Email**: Contact us at [business@shopsavvy.com](mailto:business@shopsavvy.com)

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make the ShopSavvy TypeScript SDK better! 🛍️