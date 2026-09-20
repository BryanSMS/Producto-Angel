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
      let arranged = [];
      const spotlight = root.querySelector('.space-spotlight');
      const reticle = root.querySelector('.space-reticle');
      const quick = (target, property) => gsap.quickTo(target, property, { duration: 0.52, ease: 'power3.out' });
      const items = Array.from(root.querySelectorAll('.product-slot'), (slot) => {
        const card = slot.querySelector('.product-card');
        const drift = slot.querySelector('.product-drift');
        const camera = slot.querySelector('.product-camera');
        return {
          slot, card, drift, camera, placement: slot.querySelector('.product-placement'),
          depth: Number(slot.dataset.depth), driftStrength: Number(slot.dataset.drift), parallax: Number(slot.dataset.parallax),
          moveX: quick(drift, 'x'), moveY: quick(drift, 'y'),
          lift: quick(card, 'y'), zoom: quick(card, 'scale'), z: quick(card, 'z'),
          tiltX: quick(card, 'rotationX'), tiltY: quick(card, 'rotationY'), presence: quick(card, '--proximity'),
          cameraY: quick(camera, 'y'), cameraZ: quick(camera, 'z'),
        };
      });
      const glow = document.querySelector('.environment-glow');
      const glowY = quick(glow, 'y');

      // Cache document coordinates in one read batch. Scrolling and pointer events
      // only use these numbers; transformed children never feed back into layout.
      const measure = () => {
        const scrollY = window.scrollY;
        const rect = root.getBoundingClientRect();
        bounds = { left: rect.left, top: rect.top + scrollY, width: rect.width };
        arranged = items.filter(item => item.slot.dataset.visible === 'true').map(item => {
          const box = item.placement.getBoundingClientRect();
          return { item, left: box.left, top: box.top + scrollY, width: box.width, height: box.height };
        });
        dirty = false;
      };
      const neutral = (item) => {
        item.moveX(0); item.moveY(0); item.lift(0); item.zoom(1); item.z(0);
        item.tiltX(0); item.tiltY(0); item.presence(0);
      };
      const reset = () => {
        inside = false;
        root.dataset.pointerActive = 'false';
        root.dataset.targetNear = 'false';
        items.forEach(neutral);
      };
      const clamp = gsap.utils.clamp;
      const render = () => {
        frame = 0;
        if (root.dataset.transitioning) return;
        if (dirty) measure();
        const scrollY = window.scrollY;
        const height = window.innerHeight;
        const visible = arranged.filter(box => box.top + box.height - scrollY > -150 && box.top - scrollY < height + 150);
        glowY(-Math.min(scrollY, 2400) * 0.022);
        visible.forEach(box => {
          const progress = clamp(-1, 1, (box.top + box.height / 2 - scrollY - height / 2) / height);
          box.item.cameraY(progress * box.item.depth * 32);
          box.item.cameraZ(-progress * box.item.depth * 12);
        });
        if (!inside) return;
        const nearest = visible.reduce((best, box) => {
          const cx = box.left + box.width / 2;
          const cy = box.top - scrollY + box.height / 2;
          const edge = Math.hypot(Math.max(Math.abs(pointer.x - cx) - box.width / 2, 0), Math.max(Math.abs(pointer.y - cy) - box.height / 2, 0));
          const score = edge + Math.hypot(pointer.x - cx, pointer.y - cy) * 0.05;
          return !best || score < best.score ? { box, cx, cy, edge, score } : best;
        }, null);
        const strength = nearest ? clamp(0, 1, 1 - nearest.edge / 120) : 0;
        const globalX = clamp(-1, 1, (pointer.x - bounds.left) / bounds.width * 2 - 1);
        const globalY = clamp(-1, 1, pointer.y / height * 2 - 1);
        gsap.set([spotlight, reticle], { x: pointer.x - bounds.left, y: pointer.y + scrollY - bounds.top });
        gsap.set(reticle, { scale: 1 + strength * 0.25 });
        root.dataset.pointerActive = 'true';
        root.dataset.targetNear = String(strength > 0.4);
        visible.forEach(box => {
          const { item } = box;
          const cx = box.left + box.width / 2;
          const cy = box.top - scrollY + box.height / 2;
          const active = nearest?.box === box;
          const proximity = active ? strength : 0;
          const dx = clamp(-1, 1, (pointer.x - cx) / (box.width / 2));
          const dy = clamp(-1, 1, (pointer.y - cy) / (box.height / 2));
          const distance = Math.hypot(cx - pointer.x, cy - pointer.y);
          const push = !active && distance > 0 ? Math.max(0, 1 - distance / 600) * strength * 10 : 0;
          item.moveX(globalX * item.parallax * 10 + (push ? (cx - pointer.x) / distance * push : 0));
          item.moveY(globalY * item.parallax * 7 + (push ? (cy - pointer.y) / distance * push : 0));
          item.lift(-18 * proximity * item.driftStrength);
          item.zoom(1 + 0.045 * proximity);
          item.z(38 * proximity);
          item.tiltX(-dy * 3 * proximity);
          item.tiltY(dx * 4 * proximity);
          item.presence(proximity);
        });
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
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
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', invalidate, { passive: true });
      window.addEventListener('blur', reset);
      schedule();

      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerleave', reset);
        root.removeEventListener('space:pause', reset);
        root.removeEventListener('space:layout', invalidate);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', invalidate);
        window.removeEventListener('blur', reset);
        delete root.dataset.pointerActive;
        delete root.dataset.targetNear;
        items.forEach(item => {
          [item.moveX, item.moveY, item.lift, item.zoom, item.z, item.tiltX, item.tiltY, item.presence, item.cameraY, item.cameraZ].forEach(tween => tween.tween.kill());
          gsap.set([item.card, item.drift, item.camera], { clearProps: 'transform,--proximity' });
        });
        glowY.tween.kill();
        gsap.set(glow, { clearProps: 'transform' });
      };
    }, root);
    return () => media.revert();
  }, [rootRef, enabled]);
}
