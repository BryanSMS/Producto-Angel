import { useState } from 'react';
import { getCategoryVisual } from '../utils/categoryVisuals';
import './ProductImage.css';

export function ProductImage({ producto, className = '', iconSize = 40, forcePlaceholder = false }) {
  const [failed, setFailed] = useState(false);
  const { icon: Icon, color } = getCategoryVisual(producto.categoria);
  const showPlaceholder = forcePlaceholder || !producto.imagen || failed;
  return (
    <div className={`product-image-frame ${className}`}>
      {showPlaceholder ? (
        <div className="product-image-placeholder" style={{ '--placeholder-color': color }} role="img" aria-label={producto.nombre}>
          <span className="placeholder-orb"><Icon size={iconSize} strokeWidth={1} /></span>
          <span className="placeholder-reference" aria-hidden="true">{producto.id}</span>
        </div>
      ) : (
        <img src={producto.imagen} alt={producto.nombre} className="product-image" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      )}
    </div>
  );
}
