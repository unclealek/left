import { describe, expect, it, vi } from "vitest";
import { getLegalUrl, isWebsiteDocumentReady, openLegalWebsite } from "./legal-links";

describe("legal website links", () => {
  it("requires an explicit public HTTPS URL", () => {
    for (const url of [undefined, "", "http://example.com/privacy", "javascript:alert(1)", "https://user:password@example.com/privacy", "https://localhost/privacy"]) {
      expect(getLegalUrl(url)).toBeNull();
    }
    expect(getLegalUrl("https://example.com/privacy")).toBe("https://example.com/privacy");
  });
  it("requires approved publication metadata as well as a link", () => {
    expect(isWebsiteDocumentReady({ url: "https://example.com/terms", version: "v1", publishedAt: "2026-10-10" })).toBe(true);
    expect(isWebsiteDocumentReady({ url: "https://example.com/terms", version: "", publishedAt: "2026-10-10" })).toBe(false);
    expect(isWebsiteDocumentReady({ url: "", version: "v1", publishedAt: "2026-10-10" })).toBe(false);
    expect(isWebsiteDocumentReady({ url: "https://example.com/terms", version: "v1", publishedAt: "" })).toBe(false);
  });
  it("never enables acceptance for the temporary Google placeholder", () => {
    expect(isWebsiteDocumentReady({ url: "https://google.com", version: "v1", publishedAt: "2026-10-10" })).toBe(false);
  });
  it("reports missing links and browser failures without recording acceptance", async () => {
    const open = vi.fn().mockRejectedValue(new Error("offline"));
    expect(await openLegalWebsite(null, open)).toEqual({ ok: false });
    expect(open).not.toHaveBeenCalled();
    expect(await openLegalWebsite("https://example.com/privacy", open)).toEqual({ ok: false });
  });
  it("opening or closing a browser has no acceptance side effect", async () => {
    const open = vi.fn().mockResolvedValue({ type: "dismiss" });
    expect(await openLegalWebsite("https://example.com/privacy", open)).toEqual({ ok: true });
    expect(open).toHaveBeenCalledWith("https://example.com/privacy");
  });
});
