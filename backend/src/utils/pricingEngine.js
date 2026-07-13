// KEEP IN SYNC WITH frontend/src/lib/pricingEngine.js — this logic must stay identical.

// Bangles have no separate pre-order discount — Rs. 250 is their only price.
// Bundle price is set so buying 1 shirt + 1 bangle as a bundle saves exactly
// Rs. 50 vs buying them separately at pre-order prices (1700 + 250 - 50).
const PRICES = Object.freeze({
  shirt: 1700,
  bangle: 250,
  bundle: 1900,
});

const NORMAL_PRICES = Object.freeze({
  shirt: 1850,
  bangle: 250,
  bundle: 2000,
});

function assertNonNegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer, got: ${value}`);
  }
}

/**
 * Computes the minimum-cost pricing breakdown for a given number of
 * T-shirts and bangles by automatically pairing shirts with bangles
 * into bundles wherever it lowers the total.
 */
function calculateTotal(shirtCount, bangleCount) {
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

module.exports = { PRICES, NORMAL_PRICES, calculateTotal };
