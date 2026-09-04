import { describe, expect, it } from "vitest";
import { getFooterDestination } from "./leftConfig";

describe("footer navigation state", () => {
  it("keeps Map selected when hidden users enter the shared venue radar through Map", () => {
    expect(getFooterDestination("venue", { venueDestination: "nearby" })).toBe("nearby");
  });

  it("keeps Venues selected when the venue radar is opened as the venue destination", () => {
    expect(getFooterDestination("venue", { venueDestination: "session" })).toBe("session");
  });

  it("preserves the originating tab while safety controls are open", () => {
    expect(getFooterDestination("safety", { safetyReturnScreen: "home" })).toBe("home");
    expect(getFooterDestination("safety", { safetyReturnScreen: "feed" })).toBe("nearby");
    expect(getFooterDestination("safety", { safetyReturnScreen: "settings" })).toBe("account");
  });

  it("preserves a Map-origin venue radar when safety opens from it", () => {
    expect(
      getFooterDestination("safety", {
        safetyReturnScreen: "venue",
        venueDestination: "nearby",
      }),
    ).toBe("nearby");
  });
});
