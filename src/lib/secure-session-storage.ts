type Store = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};
type Manifest = { version: 1; generation: string; count: number };

/** Native sessions live entirely in protected storage, including large provider JWTs. */
export function createSecureSessionStorage(secure: Store, legacy: Store, randomId: () => string): Store {
  const queues = new Map<string, Promise<unknown>>();
  const root = (key: string) => `left.auth.${Array.from(key).map(char => char.codePointAt(0)!.toString(16)).join("-")}`;
  const chunkKey = (key: string, manifest: Manifest, index: number) => `${root(key)}.${manifest.generation}.${index}`;
  async function manifestFor(key: string): Promise<Manifest | null> {
    const raw = await secure.getItem(root(key));
    if (raw === null) return null;
    const value = JSON.parse(raw) as Manifest;
    if (value.version !== 1 || !/^[a-zA-Z0-9-]+$/.test(value.generation) || !Number.isInteger(value.count) || value.count < 1 || value.count > 320) {
      throw new Error("Invalid protected session metadata");
    }
    return value;
  }
  async function removeChunks(key: string, manifest: Manifest | null) {
    if (!manifest) return;
    for (let i = 0; i < manifest.count; i++) await secure.removeItem(chunkKey(key, manifest, i));
  }
  async function write(key: string, value: string) {
    const chars = Array.from(value);
    if (chars.length > 128_000) throw new Error("Session exceeds protected storage limit");
    const previous = await manifestFor(key);
    const next: Manifest = { version: 1, generation: randomId(), count: Math.max(1, Math.ceil(chars.length / 400)) };
    try {
      for (let i = 0; i < next.count; i++) {
        await secure.setItem(chunkKey(key, next, i), chars.slice(i * 400, (i + 1) * 400).join(""));
      }
      // Publish only after all parts are durable. Failed refreshes preserve the old session.
      await secure.setItem(root(key), JSON.stringify(next));
    } catch (error) {
      await removeChunks(key, next).catch(() => {});
      throw error;
    }
    await legacy.removeItem(key);
    await removeChunks(key, previous);
  }
  function serialize<T>(key: string, action: () => Promise<T>): Promise<T> {
    const result = (queues.get(key) ?? Promise.resolve()).then(action, action);
    const settled = result.then(() => {}, () => {});
    queues.set(key, settled);
    void settled.then(() => { if (queues.get(key) === settled) queues.delete(key); });
    return result;
  }
  return {
    getItem: key => serialize(key, async () => {
      const manifest = await manifestFor(key);
      if (!manifest) {
        const old = await legacy.getItem(key);
        if (old !== null) await write(key, old);
        return old;
      }
      let value = "";
      for (let i = 0; i < manifest.count; i++) {
        const chunk = await secure.getItem(chunkKey(key, manifest, i));
        if (chunk === null) throw new Error("Protected session is incomplete");
        value += chunk;
      }
      await legacy.removeItem(key);
      return value;
    }),
    setItem: (key, value) => serialize(key, () => write(key, value)),
    removeItem: key => serialize(key, async () => {
      const manifest = await manifestFor(key);
      // Remove the legacy copy first so a crash cannot resurrect it on the next launch.
      await legacy.removeItem(key);
      await removeChunks(key, manifest);
      await secure.removeItem(root(key));
    }),
  };
}
