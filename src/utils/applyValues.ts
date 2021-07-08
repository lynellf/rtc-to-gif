type TRecord = Record<string, unknown>;
export function applyValues(key: string, values: TRecord) {
  return values[key];
}
