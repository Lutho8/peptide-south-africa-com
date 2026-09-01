/**
 * Store-wide pre-order mode (founder directive 2026-08-31).
 * While PREORDER_MODE is true, every product is purchasable as a pre-order:
 * customers reserve now and orders ship once inventory is restocked.
 * Set PREORDER_MODE to false to restore normal in-stock behavior.
 */
export const PREORDER_MODE = true;

export const PREORDER_BADGE_TEXT = "Pre-Order — Reserve Yours!";
export const PREORDER_BANNER_TEXT =
  "Inventory restock in progress — products are available to reserve by pre-order.";
