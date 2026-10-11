/** URLs are release configuration, never inferred from an unconfirmed domain. */
export function getLegalUrl(value: string | undefined | null): string | null {
  try {
    const url = new URL(value?.trim() ?? "");
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") || url.hostname.endsWith(".localhost")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isWebsiteDocumentReady(document: {
  url: string | null;
  version: string | null;
  publishedAt: string | null;
}) {
  const url = getLegalUrl(document.url);
  if (!url || ["google.com", "www.google.com"].includes(new URL(url).hostname)) return false;
  return !!(document.version?.trim() && document.publishedAt?.trim());
}

/** Browser success is not evidence of reading, acknowledgement, or agreement. */
export async function openLegalWebsite(
  url: string | null,
  openBrowser: (url: string) => Promise<unknown>,
): Promise<{ ok: boolean }> {
  const validated = getLegalUrl(url);
  if (!validated) return { ok: false };
  try {
    await openBrowser(validated);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
