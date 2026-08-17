import { useState } from 'react';
import { getCategoryVisual } from '../utils/categoryVisuals';
import './ProductImage.css';

// Muestra la fotografía real del producto (product.imagen) si existe y carga
// correctamente. Si no hay foto todavía (caso típico con datos de demo) o la
// imagen falla, se muestra un panel local con el icono/color de la categoría
// para que el catálogo se mantenga visual sin depender de recursos externos.
export function ProductImage({ producto, className = '', iconSize = 40 }) {
  const [failed, setFailed] = useState(false);
  const { icon: Icon, color } = getCategoryVisual(producto.categoria);
  const showPlaceholder = !producto.imagen || failed;

  return (
    <div className={`product-image-frame ${className}`}>
      {showPlaceholder ? (
        <div
          className="product-image-placeholder"
          style={{ '--placeholder-color': color }}
          role="img"
          aria-label={producto.nombre}
        >
          <Icon size={iconSize} strokeWidth={1.5} />
        </div>
      ) : (
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="product-image"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
