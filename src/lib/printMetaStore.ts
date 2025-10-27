const store = new Map<string, { data: any, expireAt: number }>();

export function setMeta(token: string, data: any, ttlMs = 5 * 60 * 1000) {
  const expireAt = Date.now() + ttlMs;
  store.set(token, { data, expireAt });
  // schedule cleanup
  setTimeout(() => {
    const entry = store.get(token);
    if (entry && entry.expireAt <= Date.now()) store.delete(token);
  }, ttlMs + 1000);
}

export function getMeta(token: string) {
  const entry = store.get(token);
  if (!entry) return null;
  if (entry.expireAt <= Date.now()) {
    store.delete(token);
    return null;
  }
  return entry.data;
}

export function deleteMeta(token: string) {
  store.delete(token);
}

export function clearAll() {
  store.clear();
}

export default { setMeta, getMeta, deleteMeta };
