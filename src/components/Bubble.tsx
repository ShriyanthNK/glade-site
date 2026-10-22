interface Props {
  title: string;
  body?: string;
  project?: string;
  tone?: "normal" | "alert";
  className?: string;
  /**
   * Play the app's reveal (measured from the app, relative to the entrance start):
   * the bubble pops in from its tail with a small overshoot, the title types in one character
   * per 20 ms, then the body and project row appear. Pure CSS; static under reduced motion.
   */
  reveal?: boolean;
}

// Timings from the app's entrance (ENTER seconds): pop 0.51-0.78 s, typing from 0.59 s at 50
// characters per second, the project row right after the last character.
const TYPE_START_MS = 590;
const CHAR_MS = 20;

export function Bubble({ title, body, project = "my-project", tone = "normal", className = "", reveal = false }: Props) {
  const rest = (
    <>
      {body && <p className="mt-2 text-sm sm:text-base font-medium opacity-80">{body}</p>}
      <p className="mt-3 inline-block bg-teal px-2 py-1 text-sm font-extrabold text-outline">&gt; {project}</p>
    </>
  );
  return (
    <div
      className={`relative inline-block ${reveal ? "bubble-pop" : ""} ${className}`}
      style={{ filter: "drop-shadow(0 8px 0 rgba(0,0,0,.25))" }}
    >
      <div
        className="font-mono bg-paper text-outline px-4 py-3 max-w-[17rem] sm:px-6 sm:py-5 sm:max-w-[34rem]"
        style={{
          boxShadow:
            "0 -8px 0 0 var(--outline), 0 8px 0 0 var(--outline), -8px 0 0 0 var(--outline), 8px 0 0 0 var(--outline)",
        }}
      >
        <div className="flex items-start justify-between gap-6">
          <p
            className="text-base sm:text-xl leading-tight"
            style={{ fontWeight: 800, color: tone === "alert" ? "var(--alert)" : "var(--outline)" }}
          >
            {reveal ? (
              <>
                <span className="sr-only">{title}</span>
                <span aria-hidden>
                  {[...title].map((ch, i) => (
                    <span key={i} className="bubble-char" style={{ animationDelay: `${TYPE_START_MS + i * CHAR_MS}ms` }}>
                      {ch}
                    </span>
                  ))}
                </span>
              </>
            ) : (
              title
            )}
          </p>
          <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center border-4 border-outline bg-peach text-sm font-extrabold">x</span>
        </div>
        {reveal ? (
          <div className="bubble-grow" style={{ animationDelay: `${TYPE_START_MS + title.length * CHAR_MS + 10}ms` }}>
            <div className="min-h-0 overflow-hidden">{rest}</div>
          </div>
        ) : (
          rest
        )}
      </div>
      <div aria-hidden className="absolute left-1/2 top-full -translate-x-1/2">
        <div className="mx-auto h-2 w-6 bg-outline" />
        <div className="mx-auto h-2 w-4 bg-outline" />
        <div className="mx-auto h-2 w-2 bg-outline" />
      </div>
    </div>
  );
}
