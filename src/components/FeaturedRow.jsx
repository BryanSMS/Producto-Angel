import { formatPrice } from '../utils/formatters';
import { ProductImage } from './ProductImage';
import './FeaturedRow.css';

export function FeaturedRow({ products, onProductClick }) {
  if (!products.length) return null;

  return (
    <section className="featured-row-section" aria-label="Productos destacados">
      <div className="featured-row-container">
        <h2 className="featured-row-title">Destacados</h2>
        <div className="featured-row-scroll">
          {products.map((product) => (
            <button
              key={product.id}
              className="featured-card"
              onClick={() => onProductClick(product)}
              aria-label={`Ver detalles de ${product.nombre}, ${formatPrice(product.precio)}`}
            >
              <div className="featured-card-image">
                <ProductImage producto={product} iconSize={32} />
              </div>
              <div className="featured-card-info">
                <p className="featured-card-name">{product.nombre}</p>
                <p className="featured-card-price">{formatPrice(product.precio)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
