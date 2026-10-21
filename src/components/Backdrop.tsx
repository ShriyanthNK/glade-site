// Fixed pixel-art night forest behind the whole page (public/backdrop.png, drawn by
// scripts/make-backdrop.mjs at 480x270). The scene box is sized like background-size: cover,
// anchored bottom-centre, and the firefly SVG shares its 480x270 viewBox so one SVG unit is one
// art pixel at any viewport size.

type Firefly = { x: number; y: number; blink: number; delay: number; drift: number };

// x/y in art pixels; blink/drift cycles in seconds (all well under 3 flashes per second).
const FIREFLIES: Firefly[] = [
  { x: 118, y: 214, blink: 4.2, delay: 0, drift: 9 },
  { x: 152, y: 232, blink: 5.6, delay: 1.9, drift: 11 },
  { x: 189, y: 206, blink: 3.4, delay: 0.7, drift: 8 },
  { x: 214, y: 238, blink: 4.8, delay: 2.8, drift: 12 },
  { x: 236, y: 219, blink: 6.2, delay: 1.2, drift: 10 },
  { x: 258, y: 243, blink: 3.8, delay: 3.4, drift: 9 },
  { x: 281, y: 212, blink: 5.2, delay: 0.4, drift: 13 },
  { x: 297, y: 233, blink: 4.4, delay: 2.2, drift: 8 },
  { x: 327, y: 222, blink: 3.6, delay: 1.5, drift: 11 },
  { x: 356, y: 241, blink: 5.8, delay: 3.0, drift: 10 },
  { x: 384, y: 210, blink: 4.0, delay: 0.9, drift: 12 },
  { x: 72, y: 236, blink: 6.6, delay: 2.5, drift: 9 },
];

export function Backdrop() {
  return (
    <div aria-hidden className="backdrop">
      <div className="backdrop-scene backdrop-art" />
      <div className="backdrop-scrim" />
      <div className="backdrop-scene">
        <svg viewBox="0 0 480 270" className="backdrop-flies" shapeRendering="crispEdges" focusable="false">
          {FIREFLIES.map((f) => (
            <g key={`${f.x}-${f.y}`} transform={`translate(${f.x} ${f.y})`}>
              <g
                className="firefly"
                style={{ animationDuration: `${f.blink}s, ${f.drift}s`, animationDelay: `-${f.delay}s, -${f.delay * 2}s` }}
              >
                <rect x={-1} y={0} width={3} height={1} className="firefly-halo" />
                <rect x={0} y={-1} width={1} height={3} className="firefly-halo" />
                <rect x={0} y={0} width={1} height={1} className="firefly-core" />
              </g>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
