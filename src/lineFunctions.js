module.exports.even = function even(version) {
  const major = version.major === 0 ? version.minor : version.major;
  return major % 2 === 0;
};

module.exports.odd = function odd(version) {
  const major = version.major === 0 ? version.minor : version.major;
  return major % 2 === 1;
};
