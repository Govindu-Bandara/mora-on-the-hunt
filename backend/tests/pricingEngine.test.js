const { calculateTotal } = require('../src/utils/pricingEngine');

describe('pricingEngine.calculateTotal', () => {
  test('example 1: 2 shirts + 1 bangle = 3550 (1 bundle + 1 shirt)', () => {
    const result = calculateTotal(2, 1);
    expect(result.bundleCount).toBe(1);
    expect(result.remainingShirts).toBe(1);
    expect(result.remainingBangles).toBe(0);
    expect(result.finalTotal).toBe(3550);
  });

  test('example 2: 3 shirts + 2 bangles = 5400 (2 bundles + 1 shirt)', () => {
    const result = calculateTotal(3, 2);
    expect(result.bundleCount).toBe(2);
    expect(result.remainingShirts).toBe(1);
    expect(result.remainingBangles).toBe(0);
    expect(result.finalTotal).toBe(5400);
  });

  test('example 3: 1 shirt + 3 bangles = 2350 (1 bundle + 2 bangles at Rs. 250 each)', () => {
    const result = calculateTotal(1, 3);
    expect(result.bundleCount).toBe(1);
    expect(result.remainingShirts).toBe(0);
    expect(result.remainingBangles).toBe(2);
    expect(result.finalTotal).toBe(2350);
  });

  test('0 shirts and 0 bangles = 0', () => {
    expect(calculateTotal(0, 0).finalTotal).toBe(0);
  });

  test('0 shirts, N bangles = N * 250', () => {
    expect(calculateTotal(0, 5).finalTotal).toBe(1250);
  });

  test('N shirts, 0 bangles = N * 1700', () => {
    expect(calculateTotal(4, 0).finalTotal).toBe(6800);
  });

  test('equal counts bundle everything', () => {
    const result = calculateTotal(3, 3);
    expect(result.bundleCount).toBe(3);
    expect(result.remainingShirts).toBe(0);
    expect(result.remainingBangles).toBe(0);
    expect(result.finalTotal).toBe(3 * 1850);
  });

  test('large counts', () => {
    const result = calculateTotal(50, 50);
    expect(result.finalTotal).toBe(50 * 1850);
  });

  test('bundleSavings reflects discount vs buying separately', () => {
    const result = calculateTotal(2, 1);
    const fullSeparate = 2 * 1700 + 1 * 250;
    expect(result.bundleSavings).toBe(fullSeparate - result.finalTotal);
  });

  test('throws on negative input', () => {
    expect(() => calculateTotal(-1, 0)).toThrow();
  });

  test('throws on non-integer input', () => {
    expect(() => calculateTotal(1.5, 0)).toThrow();
  });
});
