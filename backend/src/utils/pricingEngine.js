// KEEP IN SYNC WITH frontend/src/lib/pricingEngine.js — this logic must stay identical.

// Bangles have no separate pre-order discount — Rs. 250 is their only price.
// Bundle price is derived so buying 1 shirt + 1 bangle as a bundle saves exactly
// BUNDLE_DISCOUNT vs buying them separately — computed for both the pre-order and
// regular shirt prices so the two bundle figures can never drift out of sync.
const BUNDLE_DISCOUNT = 50;
const SHIRT_PRE = 1700;
const SHIRT_REGULAR = 1850;
const BANGLE = 250;

const PRICES = Object.freeze({
  shirt: SHIRT_PRE,
  bangle: BANGLE,
  bundle: SHIRT_PRE + BANGLE - BUNDLE_DISCOUNT, // 1900
});

const NORMAL_PRICES = Object.freeze({
  shirt: SHIRT_REGULAR,
  bangle: BANGLE,
  bundle: SHIRT_REGULAR + BANGLE - BUNDLE_DISCOUNT, // 2050
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
