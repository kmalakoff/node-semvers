export default function match(test: object, query: object): boolean {
  for (const key in query) {
    if (test[key] !== query[key]) return false;
  }
  return true;
}
