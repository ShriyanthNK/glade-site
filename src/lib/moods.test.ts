import { MOODS, THRESHOLDS, moodForWait, MAX_WAIT_SECONDS } from "./moods";

describe("moodForWait", () => {
  it("is calm at the start", () => expect(moodForWait(0)).toBe("calm"));
  it("stays calm just below the annoyed threshold", () =>
    expect(moodForWait(THRESHOLDS.annoyed - 1)).toBe("calm"));
  it("is annoyed at the annoyed threshold", () =>
    expect(moodForWait(THRESHOLDS.annoyed)).toBe("annoyed"));
  it("stays annoyed just below the angry threshold", () =>
    expect(moodForWait(THRESHOLDS.angry - 1)).toBe("annoyed"));
  it("is angry at the angry threshold", () =>
    expect(moodForWait(THRESHOLDS.angry)).toBe("angry"));
  it("is angry at the give-up age", () =>
    expect(moodForWait(MAX_WAIT_SECONDS)).toBe("angry"));
  it("uses the app's impatience tiers (60 s and 120 s after Hoot appears)", () =>
    expect(THRESHOLDS).toEqual({ annoyed: 60, angry: 120 }));
});

describe("MOODS copy", () => {
  it("matches the app verbatim", () => {
    expect(MOODS.done.title).toBe("CLAUDE'S DONE, YOUR TURN");
    expect(MOODS.calm.title).toBe("CLAUDE'S WAITING ON YOU");
    expect(MOODS.calm.body).toBe("Run: npm test --coverage");
    expect(MOODS.done.body).toBe("Refactored the parser and fixed 3 failing tests.");
    expect(MOODS.annoyed.title).toBe("STILL WAITING...");
    expect(MOODS.angry.title).toBe("HELLOOO? CLAUDE NEEDS YOU");
    expect(MOODS.angry.tone).toBe("alert");
  });
});
