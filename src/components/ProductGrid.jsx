import { ProductCard } from './ProductCard';
import './ProductGrid.css';

export function ProductGrid({ products, onProductClick }) {
  return (
    <section className="product-grid-section">
      <div className="product-grid-container">
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
