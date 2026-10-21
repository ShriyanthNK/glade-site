import { MOODS, type MoodId } from "@/lib/moods";
import { MOCHI_LOOPS } from "@/lib/mochi-animation.generated";
import { Bubble } from "./Bubble";
import { AnimatedMochi } from "./AnimatedMochi";

interface Props { mood: MoodId; project?: string; scale?: number }

// The Bubble's tail is 24px tall below its box. Pull Mochi's frame up under it so the tail tip
// lands where the app's tail points in that mood (manifest bubbleTip, in sheet px).
const TAIL_PX = 24;

export function MochiStage({ mood, project, scale = 8 }: Props) {
  const m = MOODS[mood];
  const sheet = MOCHI_LOOPS[mood];
  const px = scale / sheet.sheetPxPerArtPx;
  const tipY = sheet.bubbleTip?.y ?? 0;
  return (
    <figure className="flex flex-col items-center">
      <Bubble className="relative z-10" title={m.title} body={m.body} tone={m.tone} project={project} />
      {/* Mochi is drawn in front of the bubble, as in the app (he hops over its tail). */}
      <div className="relative z-20" style={{ marginTop: `${TAIL_PX - tipY * px}px` }}>
        <AnimatedMochi key={mood} mood={mood} scale={scale} title="Mochi" />
      </div>
    </figure>
  );
}
