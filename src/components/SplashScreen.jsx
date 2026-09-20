import { useLayoutEffect, useRef } from 'react';
import { tienda } from '../config/tienda';
import { gsap } from '../utils/animations';
import './SplashScreen.css';

export function SplashScreen({ onFinish }) {
  const revealRef = useRef(null);
  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finishOnPreference = () => { if (reduced.matches) onFinish(); };
    const context = gsap.context(() => {
      gsap.timeline({ onComplete: onFinish })
        .to('.splash-brand', { opacity: 0, duration: 0.2 }, 0.08)
        .to('.splash-screen', { clipPath: 'inset(100% 0 0 0)', duration: 0.65, ease: 'power1.inOut' }, 0)
        .fromTo('.splash-scan-line', { y: 0 }, { y: window.innerHeight, duration: 0.65, ease: 'power1.inOut' }, 0);
    }, revealRef);
    finishOnPreference();
    window.addEventListener('pointerdown', onFinish, { once: true, capture: true });
    window.addEventListener('keydown', onFinish, { once: true, capture: true });
    reduced.addEventListener('change', finishOnPreference);
    return () => {
      context.revert();
      window.removeEventListener('pointerdown', onFinish, true);
      window.removeEventListener('keydown', onFinish, true);
      reduced.removeEventListener('change', finishOnPreference);
    };
  }, [onFinish]);

  return (
    <div ref={revealRef} className="splash-reveal" aria-hidden="true">
      <div className="splash-screen"><p className="splash-brand">{tienda.nombre}</p></div>
      <div className="splash-scan-line" />
    </div>
  );
}
