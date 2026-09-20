import { useLayoutEffect, useRef } from 'react';
import { gsap, motionQuery } from '../utils/animations';
import './ResultCounter.css';

export function ResultCounter({ count }) {
  const numberRef = useRef(null);
  const previous = useRef(count);
  useLayoutEffect(() => {
    const number = numberRef.current;
    const value = { count: previous.current };
    previous.current = count;
    const media = gsap.matchMedia();
    media.add({ motion: motionQuery, reduced: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
      if (conditions.reduced) { number.textContent = String(count).padStart(2, '0'); return; }
      const tween = gsap.to(value, {
        count, duration: 0.3, ease: 'power2.out',
        onUpdate: () => { number.textContent = String(Math.round(value.count)).padStart(2, '0'); },
      });
      return () => { tween.kill(); number.textContent = String(count).padStart(2, '0'); };
    });
    return () => media.revert();
  }, [count]);
  return (
    <div className="result-counter">
      <span aria-hidden="true"><b ref={numberRef}>{String(count).padStart(2, '0')}</b> ITEMS</span>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{count} resultados</span>
    </div>
  );
}
