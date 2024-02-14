// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
module.exports = function isNaN(value) {
  // biome-ignore lint/suspicious/noSelfCompare: <explanation>
  return value !== value;
};
