import { useRef, useImperativeHandle } from 'react';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import { useProductFlip } from '../hooks/useProductFlip';
import { useProductSpace } from '../hooks/useProductSpace';
import { getProductPlacement } from '../utils/animations';
import './ProductGrid.css';

// Six anchors form an open composition; DOM and keyboard order stay unchanged.
const anchors = [
  { column: 1, span: 3, row: 0, y: 112, size: 0.86 },
  { column: 5, span: 4, row: 0, y: 0, size: 1.08 },
  { column: 10, span: 3, row: 0, y: 160, size: 0.8 },
  { column: 2, span: 3, row: 1, y: 60, size: 0.88 },
  { column: 6, span: 2, row: 1, y: 128, size: 0.92 },
  { column: 9, span: 4, row: 1, y: 26, size: 0.92 },
];

export function ProductGrid({ catalog, products, filterKey, searchActive, ready, focusOpen, animationRef, onProductClick, onReset }) {
  const rootRef = useRef(null);
  const visibleOrder = new Map(products.map((product, index) => [product.id, index]));
  const capture = useProductFlip(rootRef, filterKey, ready);
  useImperativeHandle(animationRef, () => ({ capture }), [capture]);
  useProductSpace(rootRef, ready && !focusOpen);
  const few = products.length > 0 && products.length <= 3;

  return (
    <section ref={rootRef}
      className={`product-grid-section ${searchActive ? 'is-searching' : ''} ${few ? 'has-few-results' : ''} ${products.length === 1 ? 'has-single-result' : ''} ${products.length === 0 ? 'is-empty' : ''}`}
      aria-label="Espacio de productos">
      <div className="space-spotlight" aria-hidden="true" />
      <div className="space-reticle" aria-hidden="true"><span /></div>
      <div className="product-grid">
        {catalog.map((product, originalIndex) => {
          const visible = visibleOrder.has(product.id);
          const index = visibleOrder.get(product.id) ?? originalIndex;
          const anchor = anchors[index % anchors.length];
          const placement = getProductPlacement(product.id);
          return (
            <div key={product.id} className="product-slot" data-flip-id={product.id} data-visible={visible}
              data-depth={placement.depth} data-drift={placement.drift} data-parallax={placement.parallax}
              aria-hidden={!visible} inert={!visible}
              style={{ '--space-column': anchor.column, '--space-span': anchor.span,
                '--space-row': Math.floor(index / 6) * 2 + anchor.row + 1 }}>
              <div className="product-placement" style={{
                '--object-x': `${placement.x}px`, '--object-y': `${placement.y}px`,
                '--object-scale': placement.scale, '--object-depth': placement.depth,
                '--object-angle': `${placement.angle}deg`, '--anchor-y': `${anchor.y}px`, '--anchor-size': anchor.size,
              }}>
                <div className="product-camera">
                  <div className="product-drift">
                    <ProductCard product={product} visible={visible} onClick={event => onProductClick(product, event.currentTarget)} />
                  </div>
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
