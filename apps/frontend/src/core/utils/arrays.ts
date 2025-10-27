export function asArray<T = unknown>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function safeFilter<T>(
  value: unknown,
  predicate: (item: T, index: number) => boolean,
): T[] {
  return asArray<T>(value).filter(predicate);
}

