import { X, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { formatPrice } from '../utils/formatters';
import { ProductImage } from './ProductImage';
import { tienda } from '../config/tienda';
import './ProductModal.css';

export function ProductModal({ product, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const enOferta = product.precioAnterior != null && product.precioAnterior > product.precio;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Consulta de disponibilidad por WhatsApp: acción secundaria e informativa.
  // No implica compra, checkout ni pago dentro de la aplicación.
  const mensajeWhatsApp = encodeURIComponent(
    tienda.mensajeConsultaWhatsApp
      .replace('{producto}', product.nombre)
      .replace('{marca}', product.marca || product.categoria)
      .replace('{precio}', formatPrice(product.precio))
  );
  const enlaceWhatsApp = `https://wa.me/${tienda.telefonoWhatsApp}?text=${mensajeWhatsApp}`;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        <div className="modal-drag-handle" aria-hidden="true" />

        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar ficha de producto"
        >
          <X size={22} />
        </button>

        <div className="modal-image-wrapper">
          <ProductImage producto={product} iconSize={64} />
          {!product.disponible && (
            <div className="modal-unavailable-overlay">
              <span>Agotado</span>
            </div>
          )}
        </div>

        <div className="modal-info">
          {product.marca && <p className="modal-brand">{product.marca}</p>}
          <h2 className="modal-title" id="modal-title">{product.nombre}</h2>
          <p className="modal-unit">{product.unidad}</p>

          <div className="modal-price-row">
            <span className="price-tag modal-price-tag">
              {enOferta && (
                <span className="price-previous">{formatPrice(product.precioAnterior)}</span>
              )}
              <span className="price-current">{formatPrice(product.precio)}</span>
            </span>
            {product.destacado && <span className="modal-chip">Destacado</span>}
          </div>

          {product.descripcion && (
            <p className="modal-description">{product.descripcion}</p>
          )}

          <dl className="modal-meta">
            {product.preciosPorCantidad && product.preciosPorCantidad.length > 0 && (
              <div className="modal-meta-row">
                <dt>Por cantidad</dt>
                <dd>
                  {product.preciosPorCantidad
                    .map((tier) => `${tier.cantidad} por ${formatPrice(tier.precio)}`)
                    .join(' · ')}
                </dd>
              </div>
            )}
            <div className="modal-meta-row">
              <dt>Categoría</dt>
              <dd>{product.categoria}{product.grupo ? ` · ${product.grupo}` : ''}</dd>
            </div>
            <div className="modal-meta-row">
              <dt>Código</dt>
              <dd>{product.id}</dd>
            </div>
            <div className="modal-meta-row">
              <dt>Disponibilidad</dt>
              <dd className={product.disponible ? 'is-available' : 'is-unavailable'}>
                {product.disponible ? 'Disponible en tienda' : 'Agotado'}
              </dd>
            </div>
          </dl>

          <a
            href={enlaceWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-whatsapp-button"
          >
            <MessageCircle size={18} />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
