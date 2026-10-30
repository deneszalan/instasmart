import { describe, expect, it } from 'vitest';
import { pinchTransform } from '../src/lib/pinch-zoom';

describe('pinching a picture', () => {
  const origin = { x: 20, y: 100 };
  const start = { x: 120, y: 300 };
  const at = (now: { x: number; y: number }, gap: number) => {
    const t = pinchTransform(origin, start, now, 100, gap);
    // Where the spot first pinched lands on screen.
    return { scale: t.scale, x: origin.x + t.x + t.scale * (start.x - origin.x), y: origin.y + t.y + t.scale * (start.y - origin.y) };
  };
  it('keeps the pinched spot under the fingers as they spread', () => {
    expect(at(start, 200)).toEqual({ scale: 2, x: 120, y: 300 });
  });
  it('follows the fingers when they move', () => {
    expect(at({ x: 150, y: 260 }, 150)).toEqual({ scale: 1.5, x: 150, y: 260 });
  });
  it('never shrinks the picture and stops at four times its size', () => {
    expect(pinchTransform(origin, start, start, 100, 50).scale).toBe(1);
    expect(pinchTransform(origin, start, start, 100, 900).scale).toBe(4);
  });
});
