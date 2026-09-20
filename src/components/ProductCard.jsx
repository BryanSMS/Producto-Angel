import { formatPrice } from '../utils/formatters';
import { ProductImage } from './ProductImage';
import './ProductCard.css';

export function ProductCard({ product, onClick, visible = true }) {
  return (
    <button
      type="button"
      className="product-card"
      tabIndex={visible ? 0 : -1}
      onClick={onClick}
      aria-label={`Ver detalles de ${product.nombre}, ${formatPrice(product.precio)}`}
    >
      <div className="product-image-wrapper">
        <ProductImage producto={product} iconSize={64} />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.nombre}</h3>
        <p className="product-unit">{product.unidad}</p>

        <p className="price-current">{formatPrice(product.precio)}</p>
      </div>
    </button>
  );
}
