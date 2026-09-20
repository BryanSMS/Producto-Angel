import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

export { gsap, Flip };
export const motionQuery = '(prefers-reduced-motion: no-preference)';
export const pointerMotionQuery =
  '(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

// Stable per product, independent of filtering, render order and viewport.
const placements = [
  { x: -6, y: 8, scale: 0.96, depth: 0.35, angle: -1.2 },
  { x: 5, y: 34, scale: 1.01, depth: 0.85, angle: 1 },
  { x: -4, y: -12, scale: 0.94, depth: 0.25, angle: -0.8 },
  { x: 8, y: 18, scale: 0.99, depth: 0.65, angle: 1.3 },
  { x: -7, y: 40, scale: 0.97, depth: 0.5, angle: -1 },
  { x: 3, y: -4, scale: 1.02, depth: 1, angle: 0.7 },
];

export function getProductPlacement(id) {
  const hash = Array.from(id).reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0);
  return placements[hash % placements.length];
}
