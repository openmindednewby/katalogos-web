/* eslint-disable react-native/no-raw-text, react-native/no-inline-styles, i18next/no-literal-string, react/jsx-no-literals */
/**
 * Native Products Showcase Page.
 * Displays products from dummyjson API in a native HTML table.
 * Includes category filters and error/retry state.
 *
 * Note: This is a web-only page that uses native HTML elements,
 * so React Native and i18n linting rules are disabled.
 */
import type { ReactElement } from 'react';
import { useState } from 'react';

import { Platform } from 'react-native';

import { isValueDefined } from '../../../../utils/is';
import { useProducts } from '../../hooks/useProducts';

import type { Product } from '../../hooks/useProducts';

const FALLBACK_PADDING = 20;
const PRICE_DECIMAL_PLACES = 2;

function filterProducts(products: Product[], category: string | null): Product[] {
  if (!isValueDefined(category)) return products;
  return products.filter((p) => p.category === category);
}

export const NativeProductsPage = (): ReactElement => {
  const { products, categories, isLoading, error, retry } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (Platform.OS !== 'web')
    return (
      <div style={{ padding: FALLBACK_PADDING }}>
        <p>This page is only available on web.</p>
      </div>
    );

  const hasError = isValueDefined(error);
  const isReady = !isLoading && !hasError;
  const filtered = filterProducts(products, selectedCategory);

  return (
    <div data-testid="native-products-page" style={{ padding: FALLBACK_PADDING }}>
      <h2>Products</h2>

      {isLoading ? <p>Loading products...</p> : null}

      {hasError ? <div>
          <p>Error: {error}</p>
          <button data-testid="btn-retry" type="button" onClick={retry}>
            Retry
          </button>
        </div> : null}

      {isReady ? <>
          <div data-testid="products-category-filter" style={{ marginBottom: FALLBACK_PADDING }}>
            <button
              style={{ fontWeight: !isValueDefined(selectedCategory) ? 'bold' : 'normal' }}
              type="button"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                style={{
                  marginLeft: 8,
                  fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                }}
                type="button"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div data-testid="native-products-grid">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(PRICE_DECIMAL_PLACES)}</td>
                    <td>{String(product.rating)}</td>
                    <td>{String(product.stock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </> : null}
    </div>
  );
};

export default NativeProductsPage;
