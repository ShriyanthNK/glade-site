export type MoodId = "done" | "calm" | "annoyed" | "angry";

export interface MoodDef {
  id: MoodId;
  title: string;
  body?: string;
  tone: "normal" | "alert";
}

const WAIT_BODY = "Claude needs your permission to use Bash";

export const MOODS: Record<MoodId, MoodDef> = {
  done: { id: "done", title: "CLAUDE'S DONE, YOUR TURN", tone: "normal" },
  calm: { id: "calm", title: "CLAUDE'S WAITING ON YOU", body: WAIT_BODY, tone: "normal" },
  annoyed: { id: "annoyed", title: "STILL WAITING...", body: WAIT_BODY, tone: "normal" },
  angry: { id: "angry", title: "HELLOOO? CLAUDE NEEDS YOU", body: WAIT_BODY, tone: "alert" },
};

// Seconds of waiting at which Mochi changes mood. Measured from `claude-buddy snapshot`.
export const THRESHOLDS = { annoyed: 58, angry: 118 };
export const MAX_WAIT_SECONDS = 180; // giveUpAfter default

export function moodForWait(ageSeconds: number): MoodId {
  if (ageSeconds >= THRESHOLDS.angry) return "angry";
  if (ageSeconds >= THRESHOLDS.annoyed) return "annoyed";
  return "calm";
}
