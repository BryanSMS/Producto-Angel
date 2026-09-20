import { formatPrice } from '../utils/formatters';
import { ProductImage } from './ProductImage';
import './ProductCard.css';

export function ProductCard({ product, onClick, visible = true }) {
  return (
    <button type="button" className="product-card" tabIndex={visible ? 0 : -1} onClick={onClick}
      aria-label={`Ver detalles de ${product.nombre}, ${formatPrice(product.precio)}`}>
      <div className="product-image-wrapper"><ProductImage producto={product} iconSize={88} /></div>
      <div className="product-info">
        <span className="product-category">{product.categoria}</span>
        <h3 className="product-name">{product.nombre}</h3>
        <div className="product-reading"><p className="price-current">{formatPrice(product.precio)}</p><span className="product-unit">{product.unidad}</span></div>
      </div>
      <span className="product-open-mark" aria-hidden="true">↗</span>
    </button>
  );
}
