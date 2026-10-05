export class PayloadTooLargeError extends Error {
  constructor() { super('JSON payload too large'); }
}

/** Bound actual streamed bytes, not just the caller-controlled Content-Length. */
export async function readBoundedJson(message: Request | Response, limit: number, timeoutMs = 10_000): Promise<unknown> {
  if (Number(message.headers.get('content-length')) > limit) {
    void message.body?.cancel().catch(() => {});
    throw new PayloadTooLargeError();
  }
  if (!message.body) throw new Error('Missing JSON body');
  const reader = message.body.getReader();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let complete = false;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error('JSON body timed out')), timeoutMs);
  });
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const {done, value} = await Promise.race([reader.read(), deadline]);
      if (done) { complete = true; break; }
      size += value.byteLength;
      if (size > limit) throw new PayloadTooLargeError();
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } finally {
    if (timeout) clearTimeout(timeout);
    if (!complete) void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
