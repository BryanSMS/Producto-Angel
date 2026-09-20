import { useLayoutEffect } from 'react';
import { gsap, pointerMotionQuery } from '../utils/animations';

export function useProductSpace(rootRef, enabled) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const media = gsap.matchMedia();

    media.add(pointerMotionQuery, () => {
      let frame = 0;
      let dirty = true;
      let inside = false;
      let pointer = { x: 0, y: 0 };
      let bounds;
      let visible = [];
      const spotlight = root.querySelector('.space-spotlight');
      const quick = (target, property) => gsap.quickTo(target, property, {
        duration: 0.42, ease: 'power3.out',
      });
      const items = Array.from(root.querySelectorAll('.product-slot'), (slot) => {
        const card = slot.querySelector('.product-card');
        const drift = slot.querySelector('.product-drift');
        return {
          slot, card, drift, depth: Number(slot.dataset.depth),
          moveX: quick(drift, 'x'), moveY: quick(drift, 'y'),
          lift: quick(card, 'y'), zoom: quick(card, 'scale'), z: quick(card, 'z'),
          tiltX: quick(card, 'rotationX'), tiltY: quick(card, 'rotationY'),
          presence: quick(card, '--proximity'),
        };
      });

      // All geometry reads happen together, only when layout/scroll changes.
      // Slots remain flat: pointer transforms live exclusively in their children.
      const measure = () => {
        bounds = root.getBoundingClientRect();
        visible = items.filter(({ slot }) => slot.dataset.visible === 'true').map((item) => {
          const rect = item.slot.getBoundingClientRect();
          return { ...item, rect, cx: rect.x + rect.width / 2, cy: rect.y + rect.height / 2 };
        }).filter(({ rect }) => rect.bottom > -100 && rect.top < window.innerHeight + 100);
        dirty = false;
      };

      const reset = () => {
        inside = false;
        cancelAnimationFrame(frame);
        frame = 0;
        root.dataset.pointerActive = 'false';
        items.forEach((item) => {
          item.moveX(0); item.moveY(0); item.lift(0); item.zoom(1); item.z(0);
          item.tiltX(0); item.tiltY(0); item.presence(0);
        });
      };

      const render = () => {
        frame = 0;
        if (!inside || root.dataset.transitioning) return;
        if (dirty) measure();
        const globalX = gsap.utils.clamp(-1, 1, (pointer.x - bounds.x) / bounds.width * 2 - 1);
        const globalY = gsap.utils.clamp(-1, 1, (pointer.y - window.innerHeight / 2) / (window.innerHeight / 2));
        const nearest = visible.reduce((best, item) => {
          const distance = Math.hypot(pointer.x - item.cx, pointer.y - item.cy);
          return !best || distance < best.distance ? { item, distance } : best;
        }, null);
        const radius = nearest ? Math.max(nearest.item.rect.width * 0.7, 140) : 1;
        const strength = nearest ? Math.max(0, 1 - nearest.distance / radius) : 0;

        // A bounded, non-interactive light layer: only transform is repainted.
        gsap.set(spotlight, { x: pointer.x - bounds.x, y: pointer.y - bounds.y });
        root.dataset.pointerActive = 'true';
        visible.forEach((item) => {
          const active = nearest?.item.slot === item.slot;
          const proximity = active ? strength : 0;
          const dx = active ? gsap.utils.clamp(-1, 1, (pointer.x - item.cx) / (item.rect.width / 2)) : 0;
          const dy = active ? gsap.utils.clamp(-1, 1, (pointer.y - item.cy) / (item.rect.height / 2)) : 0;
          const separation = nearest ? Math.hypot(item.cx - nearest.item.cx, item.cy - nearest.item.cy) : 0;
          const push = !active && separation > 0 ? Math.max(0, 1 - separation / 620) * strength * 7 : 0;
          item.moveX(globalX * item.depth * 4 + (push ? (item.cx - nearest.item.cx) / separation * push : 0));
          item.moveY(globalY * item.depth * 3 + (push ? (item.cy - nearest.item.cy) / separation * push : 0));
          item.lift(-13 * proximity);
          item.zoom(1 + 0.035 * proximity);
          item.z(24 * proximity);
          item.tiltX(-dy * 3.5 * proximity);
          item.tiltY(dx * 4.5 * proximity);
          item.presence(proximity);
        });
      };

      const schedule = () => { if (!frame && inside) frame = requestAnimationFrame(render); };
      const onMove = (event) => {
        if (event.pointerType === 'touch') { reset(); return; }
        inside = true;
        pointer = { x: event.clientX, y: event.clientY };
        schedule();
      };
      const invalidate = () => { dirty = true; schedule(); };
      const observer = new ResizeObserver(invalidate);
      observer.observe(root);
      root.addEventListener('pointermove', onMove, { passive: true });
      root.addEventListener('pointerleave', reset);
      root.addEventListener('space:pause', reset);
      root.addEventListener('space:layout', invalidate);
      window.addEventListener('scroll', invalidate, { passive: true });
      window.addEventListener('resize', invalidate, { passive: true });
      window.addEventListener('blur', reset);

      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerleave', reset);
        root.removeEventListener('space:pause', reset);
        root.removeEventListener('space:layout', invalidate);
        window.removeEventListener('scroll', invalidate);
        window.removeEventListener('resize', invalidate);
        window.removeEventListener('blur', reset);
        delete root.dataset.pointerActive;
        items.forEach((item) => {
          [item.moveX, item.moveY, item.lift, item.zoom, item.z, item.tiltX, item.tiltY, item.presence]
            .forEach((tween) => tween.tween.kill());
          gsap.set([item.card, item.drift], { clearProps: 'transform,--proximity' });
        });
      };
    }, root);
    return () => media.revert();
  }, [rootRef, enabled]);
}
