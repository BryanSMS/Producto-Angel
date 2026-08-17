import { useEffect, useRef } from 'react';

export function useIntersectionAnimation() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respeta prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            entry.target.style.animation = `
              slideInFade 0.35s cubic-bezier(0.33, 0.66, 0.66, 1) forwards
            `;
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  return ref;
}
