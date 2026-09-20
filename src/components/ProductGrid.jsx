import { useRef, useImperativeHandle } from 'react';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import { useProductFlip } from '../hooks/useProductFlip';
import { useProductSpace } from '../hooks/useProductSpace';
import { getProductPlacement } from '../utils/animations';
import './ProductGrid.css';

export function ProductGrid({
  catalog, products, filterKey, searchActive, ready, focusOpen,
  animationRef, onProductClick, onReset,
}) {
  const rootRef = useRef(null);
  const visibleIds = new Set(products.map((product) => product.id));
  const capture = useProductFlip(rootRef, filterKey, ready);
  useImperativeHandle(animationRef, () => ({ capture }), [capture]);
  useProductSpace(rootRef, ready && !focusOpen);

  return (
    <section
      ref={rootRef}
      className={`product-grid-section ${searchActive ? 'is-searching' : ''} ${products.length === 0 ? 'is-empty' : ''}`}
      aria-label="Espacio de productos"
    >
      <div className="space-spotlight" aria-hidden="true" />
      <div className="product-grid">
        {catalog.map((product) => {
          const visible = visibleIds.has(product.id);
          const placement = getProductPlacement(product.id);
          return (
            <div
              key={product.id}
              className="product-slot"
              data-flip-id={product.id}
              data-visible={visible}
              data-depth={placement.depth}
              aria-hidden={!visible}
              inert={!visible}
            >
              <div
                className="product-placement"
                style={{
                  '--object-x': `${placement.x}px`,
                  '--object-y': `${placement.y}px`,
                  '--object-scale': placement.scale,
                  '--object-angle': `${placement.angle}deg`,
                }}
              >
                <div className="product-drift">
                  <ProductCard
                    product={product}
                    visible={visible}
                    onClick={() => onProductClick(product)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {products.length === 0 && <EmptyState onReset={onReset} />}
    </section>
  );
}
