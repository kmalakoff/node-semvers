module.exports = function match(test, query) {
  for (const key in query) {
    if (test[key] !== query[key]) return false;
  }
  return true;
};
