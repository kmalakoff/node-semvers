export const major = function major(version) {
  return version.major === 0 ? `${version.major}.${version.minor}` : version.major;
};

export const minor = function minor(version) {
  return version.major === 0 ? `${version.major}.${version.minor}.${version.patch}` : `${version.major}.${version.minor}`;
};
