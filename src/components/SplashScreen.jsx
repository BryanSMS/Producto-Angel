import { useEffect } from 'react';
import { tienda } from '../config/tienda';
import './SplashScreen.css';

export function SplashScreen({ onFinish }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finishOnPreference = () => { if (reduced.matches) onFinish(); };
    const timer = setTimeout(onFinish, 180);
    finishOnPreference();
    window.addEventListener('pointerdown', onFinish, { once: true, capture: true });
    window.addEventListener('keydown', onFinish, { once: true, capture: true });
    reduced.addEventListener('change', finishOnPreference);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', onFinish, true);
      window.removeEventListener('keydown', onFinish, true);
      reduced.removeEventListener('change', finishOnPreference);
    };
  }, [onFinish]);

  return (
    <div className="splash-screen" aria-hidden="true">
      <span className="splash-mark" />
      <p className="splash-brand">{tienda.nombre}</p>
    </div>
  );
}
