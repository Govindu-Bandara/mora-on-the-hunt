// KEEP IN SYNC WITH backend/src/utils/pricingEngine.js — this logic must stay identical.

export const PRICES = Object.freeze({
  shirt: 1700,
  bangle: 200,
  bundle: 1850,
});

export const NORMAL_PRICES = Object.freeze({
  shirt: 1850,
  bangle: 250,
  bundle: 2000,
});

function assertNonNegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer, got: ${value}`);
  }
}

export function calculateTotal(shirtCount, bangleCount) {
  assertNonNegativeInteger(shirtCount, 'shirtCount');
  assertNonNegativeInteger(bangleCount, 'bangleCount');

  const bundleCount = Math.min(shirtCount, bangleCount);
  const remainingShirts = shirtCount - bundleCount;
  const remainingBangles = bangleCount - bundleCount;

  const bundleCost = bundleCount * PRICES.bundle;
  const remainingShirtsCost = remainingShirts * PRICES.shirt;
  const remainingBanglesCost = remainingBangles * PRICES.bangle;

  const finalTotal = bundleCost + remainingShirtsCost + remainingBanglesCost;
  const fullSeparateCost = shirtCount * PRICES.shirt + bangleCount * PRICES.bangle;
  const bundleSavings = fullSeparateCost - finalTotal;

  return {
    bundleCount,
    bundleCost,
    remainingShirts,
    remainingShirtsCost,
    remainingBangles,
    remainingBanglesCost,
    bundleSavings,
    subtotal: finalTotal,
    finalTotal,
  };
}
