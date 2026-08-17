import { useEffect, useState } from 'react';
import { tienda } from '../config/tienda';
import './SplashScreen.css';

// Pantalla inicial breve (600–900 ms). Respeta prefers-reduced-motion: si el
// usuario prefiere menos animación, se omite el efecto de escáner y se
// cierra de inmediato sin retrasar el acceso a la vitrina.
export function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      onFinish?.();
      return undefined;
    }

    const fadeTimer = setTimeout(() => setFading(true), 650);
    const endTimer = setTimeout(() => onFinish?.(), 850);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fading ? 'is-fading' : ''}`} role="presentation" aria-hidden="true">
      <div className="splash-content">
        <div className="splash-scanner">
          <div className="splash-barcode">
            <span className="splash-bar" />
            <span className="splash-bar splash-bar-thick" />
            <span className="splash-bar" />
            <span className="splash-bar splash-bar-thin" />
            <span className="splash-bar splash-bar-thick" />
            <span className="splash-bar" />
            <span className="splash-bar splash-bar-thin" />
            <span className="splash-bar" />
          </div>
          <div className="splash-scan-line" />
        </div>
        <p className="splash-brand">{tienda.nombre}</p>
        <p className="splash-tagline">{tienda.eslogan}</p>
      </div>
    </div>
  );
}
