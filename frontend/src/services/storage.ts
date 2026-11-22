type StorageArea = "local" | "session";

function area(kind: StorageArea): Storage {
  return kind === "session" ? window.sessionStorage : window.localStorage;
}

export function loadFromStorage<T>(key: string, kind: StorageArea = "local"): T | null {
  try {
    const stored = area(kind).getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

export function saveToStorage(key: string, value: unknown, kind: StorageArea = "local"): void {
  try {
    if (value === null) area(kind).removeItem(key);
    else area(kind).setItem(key, JSON.stringify(value));
  } catch {}
}
