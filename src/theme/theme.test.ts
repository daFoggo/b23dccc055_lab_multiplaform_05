import {colors} from './colors';
import {metrics, radius, spacing, touchTarget, typography} from './metrics';

const HEX = /^#[0-9A-Fa-f]{6}$/;

test('every colour token is a #RRGGBB string', () => {
  for (const value of Object.values(colors)) {
    expect(value).toMatch(HEX);
  }
});

test('typography entries have numeric size and lineHeight', () => {
  for (const style of Object.values(typography)) {
    expect(typeof style.fontSize).toBe('number');
    expect(typeof style.lineHeight).toBe('number');
    expect(style.lineHeight).toBeGreaterThanOrEqual(style.fontSize);
  }
});

test('spacing values are multiples of 4', () => {
  for (const value of Object.values(spacing)) {
    expect(value % 4).toBe(0);
  }
});

test('touchTarget is 48 and radius tokens are numbers', () => {
  expect(touchTarget).toBe(48);
  expect(metrics.touchTarget).toBe(48);
  expect(radius.card).toBe(24);
  expect(radius.control).toBe(16);
});
