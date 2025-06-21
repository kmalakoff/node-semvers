// biome-ignore lint/suspicious/noShadowRestrictedNames: Legacy
export default function isNaN(value: unknown): boolean {
  // biome-ignore lint/suspicious/noSelfCompare: Legacy
  return value !== value;
}
