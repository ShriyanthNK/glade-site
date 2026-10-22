export type MoodId = "done" | "calm" | "annoyed" | "angry";

export interface MoodDef {
  id: MoodId;
  title: string;
  /** Sentence-case title for screen readers; the visible copy stays in `title`. */
  spoken: string;
  body?: string;
  tone: "normal" | "alert";
}

const WAIT_BODY = "Claude needs your permission to use Bash";

export const MOODS: Record<MoodId, MoodDef> = {
  done: { id: "done", title: "CLAUDE'S DONE, YOUR TURN", spoken: "Claude's done, your turn", tone: "normal" },
  calm: { id: "calm", title: "CLAUDE'S WAITING ON YOU", spoken: "Claude's waiting on you", body: WAIT_BODY, tone: "normal" },
  annoyed: { id: "annoyed", title: "STILL WAITING...", spoken: "Still waiting...", body: WAIT_BODY, tone: "normal" },
  angry: { id: "angry", title: "HELLOOO? CLAUDE NEEDS YOU", spoken: "Hellooo? Claude needs you", body: WAIT_BODY, tone: "alert" },
};

// Seconds of waiting at which Hoot changes mood (the app's tiers).
export const THRESHOLDS = { annoyed: 58, angry: 118 };
export const MAX_WAIT_SECONDS = 180; // giveUpAfter default

export function moodForWait(ageSeconds: number): MoodId {
  if (ageSeconds >= THRESHOLDS.angry) return "angry";
  if (ageSeconds >= THRESHOLDS.annoyed) return "annoyed";
  return "calm";
}
