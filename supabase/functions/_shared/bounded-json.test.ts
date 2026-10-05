import { expect, it, vi } from 'vitest';
import { readBoundedJson } from './bounded-json';
it('reads JSON within the limit', async () => {expect(await readBoundedJson(new Response('{"ok":true}'),100)).toEqual({ok:true});});
it('rejects an oversized Content-Length without consuming the body', async () => {await expect(readBoundedJson(new Response('{}',{headers:{'content-length':'1000'}}),20)).rejects.toThrow('too large');});
it('enforces bytes even without Content-Length and cancels the reader', async () => {
 const cancel=vi.fn();const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(30));},cancel});
 await expect(readBoundedJson(new Response(stream),20)).rejects.toThrow('too large');expect(cancel).toHaveBeenCalled();
});
it('rejects invalid JSON and stalled bodies',async()=>{
 await expect(readBoundedJson(new Response('bad'),20)).rejects.toThrow();
 vi.useFakeTimers();const promise=readBoundedJson(new Response(new ReadableStream({})),20,100);
 const assertion=expect(promise).rejects.toThrow('timed out');await vi.advanceTimersByTimeAsync(101);await assertion;vi.useRealTimers();
});
