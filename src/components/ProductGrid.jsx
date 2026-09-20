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
          const foreground = placement.depth >= 0.85;
          return (
            <div
              key={product.id}
              className="product-slot"
              data-flip-id={product.id}
              data-visible={visible}
              data-depth={placement.depth}
              data-composition={foreground ? 'foreground' : 'recessed'}
              aria-hidden={!visible}
              inert={!visible}
            >
              <div
                className="product-placement"
                style={{
                  '--object-x': `${Math.round(placement.x * 1.5)}px`,
                  '--object-y': `${Math.round((placement.y - 12) * 1.65)}px`,
                  '--object-scale': placement.scale + (foreground ? 0.035 : -0.005),
                  '--object-inset': `${foreground ? 0 : placement.depth <= 0.35 ? 24 : 12}px`,
                  '--object-depth': placement.depth,
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
