/**
 * Port. The domain needs "a random token" — it doesn't need to know it's
 * Node's crypto module underneath. Swappable per-platform (browser
 * crypto.getRandomValues, Node crypto, etc.) without touching domain code.
 */
export interface TokenGenerator {
  generate(): string;
}
