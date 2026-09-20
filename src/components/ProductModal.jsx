import { X } from 'lucide-react';
import { useLayoutEffect, useRef, useCallback } from 'react';
import { formatPrice } from '../utils/formatters';
import { gsap, motionQuery } from '../utils/animations';
import { ProductImage } from './ProductImage';
import './ProductModal.css';

export function ProductModal({ product, isOpen, origin, onCloseStart, onClose }) {
  const dialogRef = useRef(null);
  const opening = useRef(null);
  const closing = useRef(null);

  const requestClose = useCallback(() => {
    if (closing.current) return;
    onCloseStart?.();
    opening.current?.progress(1);
    if (!window.matchMedia(motionQuery).matches) { onClose(); return; }
    const dialog = dialogRef.current;
    const art = dialog.querySelector('.product-image-frame');
    const from = art.getBoundingClientRect();
    const source = origin?.element;
    const to = source?.isConnected ? source.getBoundingClientRect() : null;
    const canReturn = to && source.closest('.product-slot')?.dataset.visible === 'true'
      && to.width > 0 && to.bottom > 0 && to.top < window.innerHeight;
    dialog.classList.add('is-closing');
    closing.current = gsap.timeline({ onComplete: onClose })
      .to(dialog, { '--focus-reveal': 0, duration: 0.32 }, 0)
      .to(dialog.querySelector('.modal-info'), { opacity: 0, y: 8, duration: 0.18 }, 0)
      .to(art, canReturn ? {
        x: to.left + to.width / 2 - from.left - from.width / 2,
        y: to.top + to.height / 2 - from.top - from.height / 2,
        scaleX: to.width / from.width, scaleY: to.height / from.height,
        duration: 0.42, ease: 'power3.inOut',
      } : { opacity: 0, scale: 0.86, y: 20, duration: 0.26, ease: 'power2.in' }, 0);
  }, [onClose, onCloseStart, origin]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const source = origin?.element;
    const previousVisibility = source?.style.visibility;
    closing.current = null;
    dialog.classList.remove('is-closing');
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    if (source) source.style.visibility = 'hidden';
    const art = dialog.querySelector('.product-image-frame');
    const to = art.getBoundingClientRect();
    const from = origin?.rect;
    const media = gsap.matchMedia();
    media.add({ motion: motionQuery, reduced: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
      if (conditions.reduced) {
        closing.current?.progress(1);
        return;
      }
      opening.current = gsap.timeline()
        .fromTo(dialog, { '--focus-reveal': 0 }, { '--focus-reveal': 1, duration: 0.42 }, 0)
        .fromTo(art, from && from.width ? {
          x: from.left + from.width / 2 - to.left - to.width / 2,
          y: from.top + from.height / 2 - to.top - to.height / 2,
          scaleX: from.width / to.width, scaleY: from.height / to.height,
        } : { scale: 0.8, y: 28 }, {
          x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.56,
          ease: 'power3.inOut', clearProps: 'transform',
        }, 0)
        .fromTo(dialog.querySelector('.modal-info'), { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', clearProps: 'transform,opacity' }, 0.08);
    });

    return () => {
      closing.current?.kill();
      closing.current = null;
      media.revert();
      if (source) source.style.visibility = previousVisibility;
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen, origin]);

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
          <ProductImage key={product.id} producto={product} iconSize={110} forcePlaceholder={origin?.placeholder} />
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
