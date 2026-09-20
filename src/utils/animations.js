import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);
export { gsap, Flip };
export const motionQuery = '(prefers-reduced-motion: no-preference)';
export const pointerMotionQuery =
  '(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

// A product keeps its physical character through filtering and reordering.
export function getProductPlacement(id) {
  const hash = Array.from(id).reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0);
  const depth = 0.25 + (hash % 7) / 8;
  return {
    x: ((hash % 9) - 4) * 3,
    y: ((hash >>> 3) % 9 - 4) * 6,
    depth,
    scale: 0.88 + ((hash >>> 5) % 7) * 0.03,
    angle: ((hash >>> 2) % 7 - 3) * 0.7,
    drift: 0.7 + ((hash >>> 4) % 5) * 0.15,
    parallax: 0.35 + depth * 0.8,
  };
}
