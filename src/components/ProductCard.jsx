import { formatPrice } from '../utils/formatters';
import { useIntersectionAnimation } from '../hooks/useIntersectionAnimation';
import { ProductImage } from './ProductImage';
import './ProductCard.css';

export function ProductCard({ product, onClick }) {
  const animationRef = useIntersectionAnimation();
  const enOferta = product.precioAnterior != null && product.precioAnterior > product.precio;

  return (
    <button
      ref={animationRef}
      className={`product-card ${!product.disponible ? 'is-unavailable' : ''}`}
      onClick={onClick}
      aria-label={`Ver detalles de ${product.nombre}, ${formatPrice(product.precio)}`}
    >
      <div className="product-image-wrapper">
        <ProductImage producto={product} />

        {product.destacado && product.disponible && (
          <span className="product-flag flag-destacado">Destacado</span>
        )}
        {enOferta && product.disponible && (
          <span className="product-flag flag-oferta">Oferta</span>
        )}
        {!product.disponible && (
          <div className="product-unavailable-overlay">
            <span>Agotado</span>
          </div>
        )}
      </div>

      <div className="product-info">
        {product.marca && <p className="product-brand">{product.marca}</p>}
        <h3 className="product-name">{product.nombre}</h3>
        <p className="product-unit">{product.unidad}</p>

        <div className="price-row">
          <span className="price-tag">
            {enOferta && (
              <span className="price-previous">{formatPrice(product.precioAnterior)}</span>
            )}
            <span className="price-current">{formatPrice(product.precio)}</span>
          </span>
        </div>
      </div>
    </button>
  );
}
