type NowFn = () => number

export class TTLCache<K, V> {
  private store = new Map<K, { value: V; expires: number }>()
  private now: NowFn
  constructor(now: NowFn = () => Date.now()) {
    this.now = now
  }
  get(key: K): V | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (entry.expires <= this.now()) {
      this.store.delete(key)
      return undefined
    }
    return entry.value
  }
  set(key: K, value: V, ttlMs: number) {
    this.store.set(key, { value, expires: this.now() + ttlMs })
  }
  delete(key: K) { this.store.delete(key) }
  clear() { this.store.clear() }
}

// Simple global caches
export const subscriptionCache = new TTLCache<string, any>()
export const usageSummaryCache = new TTLCache<string, any>()
export const invitationsCache = new TTLCache<string, any>()
