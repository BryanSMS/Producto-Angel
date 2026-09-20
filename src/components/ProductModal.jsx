import { X } from 'lucide-react';
import { useLayoutEffect, useRef, useCallback } from 'react';
import { formatPrice } from '../utils/formatters';
import { gsap, motionQuery } from '../utils/animations';
import { ProductImage } from './ProductImage';
import './ProductModal.css';

export function ProductModal({ product, isOpen, onClose }) {
  const dialogRef = useRef(null);
  const opening = useRef(null);
  const closing = useRef(null);

  const requestClose = useCallback(() => {
    if (closing.current) return;
    opening.current?.progress(1);
    if (!window.matchMedia(motionQuery).matches) {
      onClose();
      return;
    }
    closing.current = gsap.to(dialogRef.current.querySelector('.modal-image-wrapper'), {
      scale: 0.93, y: 12, opacity: 0, duration: 0.18, ease: 'power2.in', onComplete: onClose,
    });
  }, [onClose]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    closing.current = null;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    const media = gsap.matchMedia();
    media.add({ motion: motionQuery, reduced: '(prefers-reduced-motion: reduce)' }, (context) => {
      if (context.conditions.reduced) {
        if (closing.current) closing.current.progress(1);
        return;
      }
      opening.current = gsap.timeline()
        .fromTo(dialog.querySelector('.modal-image-wrapper'),
          { scale: 0.72, y: 36, rotationX: 5, opacity: 0.45 },
          { scale: 1, y: 0, rotationX: 0, opacity: 1, duration: 0.44, ease: 'power3.out', clearProps: 'transform,opacity' })
        .fromTo(dialog.querySelector('.modal-info'),
          { y: 8 }, { y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform' }, 0);
    });

    return () => {
      closing.current?.kill();
      closing.current = null;
      media.revert();
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!product) return null;

  return (
    <dialog
      ref={dialogRef}
      className="modal-overlay"
      onClick={(event) => { if (event.target === event.currentTarget) requestClose(); }}
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      aria-labelledby="modal-title"
    >
      <button type="button" className="modal-close" onClick={requestClose} aria-label="Cerrar ficha de producto">
        <X size={22} />
      </button>
      <div className="modal-content">
        <div className="modal-image-wrapper">
          <ProductImage key={product.id} producto={product} iconSize={110} />
        </div>
        <div className="modal-info">
          <h2 className="modal-title" id="modal-title">{product.nombre}</h2>
          <p className="modal-price">{formatPrice(product.precio)}</p>
          <details className="modal-secondary">
            <summary>Información adicional</summary>
            <dl className="modal-meta">
              <div className="modal-meta-row"><dt>Código interno</dt><dd>{product.id}</dd></div>
              {product.unidad && <div className="modal-meta-row"><dt>Presentación</dt><dd>{product.unidad}</dd></div>}
              <div className="modal-meta-row">
                <dt>Categoría</dt>
                <dd>{product.categoria}{product.grupo ? ` · ${product.grupo}` : ''}</dd>
              </div>
              <div className="modal-meta-row">
                <dt>Disponibilidad</dt>
                <dd className={product.disponible ? 'is-available' : 'is-unavailable'}>
                  {product.disponible ? 'Disponible' : 'Agotado'}
                </dd>
              </div>
              {product.marca && <div className="modal-meta-row"><dt>Marca</dt><dd>{product.marca}</dd></div>}
              {product.precioAnterior != null && (
                <div className="modal-meta-row"><dt>Precio anterior</dt><dd>{formatPrice(product.precioAnterior)}</dd></div>
              )}
              {product.preciosPorCantidad?.length > 0 && (
                <div className="modal-meta-row">
                  <dt>Por cantidad</dt>
                  <dd>{product.preciosPorCantidad.map((tier) => `${tier.cantidad} por ${formatPrice(tier.precio)}`).join(' · ')}</dd>
                </div>
              )}
            </dl>
            {product.descripcion && <p className="modal-description">{product.descripcion}</p>}
          </details>
        </div>
      </div>
    </dialog>
  );
}
