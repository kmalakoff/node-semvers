// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export default function isNaN(value) {
  // biome-ignore lint/suspicious/noSelfCompare: <explanation>
  return value !== value;
}
