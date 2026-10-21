import type { MoodId } from "@/lib/moods";
import { PALETTE, SPRITES, spriteToRects } from "@/lib/sprites";

interface Props { mood: MoodId; scale?: number; className?: string; title?: string }

export function PixelSprite({ mood, scale = 8, className, title }: Props) {
  const frame = SPRITES[mood];
  const rects = spriteToRects(frame, PALETTE);
  return (
    <svg
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      width={frame.width * scale}
      height={frame.height * scale}
      viewBox={`0 0 ${frame.width} ${frame.height}`}
      shapeRendering="crispEdges"
      className={className}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
      ))}
    </svg>
  );
}
