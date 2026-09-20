import { useCallback, useLayoutEffect, useRef } from 'react';
import { gsap, Flip, motionQuery } from '../utils/animations';

export function useProductFlip(rootRef, filterKey, ready) {
  const pendingState = useRef(null);
  const transition = useRef(null);
  const entrance = useRef(null);
  const motionAllowed = useRef(false);

  const finish = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.set(root.querySelectorAll('.product-slot'), { clearProps: 'filter' });
    delete root.dataset.transitioning;
    root.dispatchEvent(new Event('space:layout'));
  }, [rootRef]);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      motionAllowed.current = true;
      return () => {
        motionAllowed.current = false;
        pendingState.current = null;
        transition.current?.progress(1).kill();
        entrance.current?.progress(1).kill();
        finish();
      };
    });
    return () => media.revert();
  }, [finish]);

  // Called synchronously before React changes category/search visibility.
  const capture = useCallback(() => {
    const root = rootRef.current;
    if (!root || !motionAllowed.current) return;
    root.dispatchEvent(new Event('space:pause'));
    // Read the current in-flight frame, then release the previous animation.
    // A new keystroke never waits for a previous transition to finish.
    const state = Flip.getState(root.querySelectorAll('.product-slot'), { kill: false, props: 'opacity' });
    transition.current?.progress(1).kill();
    entrance.current?.progress(1).kill();
    pendingState.current = state;
  }, [rootRef]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const state = pendingState.current;
    pendingState.current = null;
    if (!root || !state || !motionAllowed.current) {
      finish();
      return;
    }

    root.dataset.transitioning = 'true';
    transition.current = Flip.from(state, {
      targets: root.querySelectorAll('.product-slot'),
      duration: 0.56,
      ease: 'power2.out',
      scale: true,
      absoluteOnLeave: true,
      prune: true,
      props: 'opacity',
      onEnter: (elements) => gsap.fromTo(elements,
        { opacity: 0.12, scale: 0.78, y: 34, filter: 'blur(3px)' },
        { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.48, stagger: { amount: 0.1 },
          ease: 'power3.out', clearProps: 'opacity,transform,filter' }),
      onLeave: (elements) => gsap.to(elements,
        { opacity: 0, scale: 0.76, y: 28, x: (index) => index % 2 ? 18 : -18,
          filter: 'blur(3px)', duration: 0.32, ease: 'power2.in' }),
      onComplete: finish,
    });
  }, [filterKey, finish, rootRef]);

  useLayoutEffect(() => {
    if (!ready || !motionAllowed.current) return;
    entrance.current = gsap.fromTo(
      rootRef.current.querySelectorAll('.product-slot[data-visible="true"]'),
      { opacity: 0.15, scale: 0.88, y: 26 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: { amount: 0.1 },
        ease: 'power2.out', clearProps: 'opacity,transform', onComplete: finish },
    );
    return () => entrance.current?.progress(1).kill();
  }, [ready, finish, rootRef]);

  return capture;
}
