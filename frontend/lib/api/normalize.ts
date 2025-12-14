// Simple normalization helpers: snake_case <-> camelCase (shallow)

function toCamel(s: string) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnake(s: string) {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function snakeToCamel<T = any>(obj: any): T {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out: any = {};
  for (const key of Object.keys(obj)) {
    const v = (obj as any)[key];
    const k = toCamel(key);
    out[k] = v;
  }
  return out as T;
}

export function camelToSnake(obj: any): any {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out: any = {};
  for (const key of Object.keys(obj)) {
    const v = (obj as any)[key];
    const k = toSnake(key);
    out[k] = v;
  }
  return out;
}

export default { snakeToCamel, camelToSnake };
