import { MOODS, type MoodId } from "@/lib/moods";
import { Bubble } from "./Bubble";
import { PixelSprite } from "./PixelSprite";

interface Props { mood: MoodId; project?: string; scale?: number; bob?: boolean }

// Sprite top sits 16px below the bubble box, so the 24px tail overlaps it by 8px;
// matches the app snapshots (sign tops have no outline, bubble stays above in z-order).
const GAP_CLASS = "mt-4";

export function MochiStage({ mood, project, scale = 8, bob = true }: Props) {
  const m = MOODS[mood];
  return (
    <figure className="flex flex-col items-center" aria-live="polite">
      <Bubble className="relative z-10" title={m.title} body={m.body} tone={m.tone} project={project} />
      <div className={`flex items-end justify-center ${GAP_CLASS}`}>
        <PixelSprite mood={mood} scale={scale} className={bob ? "mochi-bob" : undefined} title={`Mochi, ${m.title.toLowerCase()}`} />
      </div>
    </figure>
  );
}
