import { describe, test, expect } from 'vitest';
import { calculateTotal } from './pricingEngine';

describe('pricingEngine.calculateTotal (frontend mirror)', () => {
  test('example 1: 2 shirts + 1 bangle = 3550', () => {
    expect(calculateTotal(2, 1).finalTotal).toBe(3550);
  });

  test('example 2: 3 shirts + 2 bangles = 5400', () => {
    expect(calculateTotal(3, 2).finalTotal).toBe(5400);
  });

  test('example 3: 1 shirt + 3 bangles = 2350 (bangle has no pre-order discount)', () => {
    expect(calculateTotal(1, 3).finalTotal).toBe(2350);
  });

  test('0 shirts and 0 bangles = 0', () => {
    expect(calculateTotal(0, 0).finalTotal).toBe(0);
  });

  test('throws on negative input', () => {
    expect(() => calculateTotal(-1, 0)).toThrow();
  });
});
