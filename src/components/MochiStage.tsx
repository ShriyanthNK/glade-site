import { MOODS, type MoodId } from "@/lib/moods";
import { Bubble } from "./Bubble";
import { PixelSprite } from "./PixelSprite";

interface Props { mood: MoodId; project?: string; scale?: number; bob?: boolean }

// Sprite top sits 16px below the bubble box: the 24px tail overlaps the sprite top by 8px,
// and the sign top sits flush below the bubble border, as in the app snapshots.
const GAP_CLASS = "mt-4";

export function MochiStage({ mood, project, scale = 8, bob = true }: Props) {
  const m = MOODS[mood];
  return (
    <figure className="flex flex-col items-center">
      <Bubble className="relative z-10" title={m.title} body={m.body} tone={m.tone} project={project} />
      <div className={`flex items-end justify-center ${GAP_CLASS}`}>
        <PixelSprite mood={mood} scale={scale} className={bob ? "mochi-bob" : undefined} title="Mochi" />
      </div>
    </figure>
  );
}
