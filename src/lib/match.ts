export default function match(test: Record<string, unknown>, query: Record<string, unknown>): boolean {
  for (const key in query) {
    if (test[key] !== query[key]) return false;
  }
  return true;
}
