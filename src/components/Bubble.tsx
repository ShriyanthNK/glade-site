interface Props {
  title: string;
  body?: string;
  project?: string;
  tone?: "normal" | "alert";
  className?: string;
}

export function Bubble({ title, body, project = "my-project", tone = "normal", className = "" }: Props) {
  return (
    <div className={`relative inline-block ${className}`} style={{ filter: "drop-shadow(0 8px 0 rgba(0,0,0,.25))" }}>
      <div
        className="font-mono bg-paper text-outline px-6 py-5 max-w-[34rem]"
        style={{
          boxShadow:
            "0 -8px 0 0 var(--outline), 0 8px 0 0 var(--outline), -8px 0 0 0 var(--outline), 8px 0 0 0 var(--outline)",
        }}
      >
        <div className="flex items-start justify-between gap-6">
          <p
            className="text-lg sm:text-xl leading-tight"
            style={{ fontWeight: 800, color: tone === "alert" ? "var(--alert)" : "var(--outline)" }}
          >
            {title}
          </p>
          <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center border-4 border-outline bg-peach text-sm font-extrabold">x</span>
        </div>
        {body && <p className="mt-2 text-sm sm:text-base font-medium opacity-80">{body}</p>}
        <p className="mt-3 inline-block bg-teal px-2 py-1 text-sm font-extrabold text-outline">&gt; {project}</p>
      </div>
      <div aria-hidden className="absolute left-1/2 top-full -translate-x-1/2">
        <div className="mx-auto h-2 w-6 bg-outline" />
        <div className="mx-auto h-2 w-4 bg-outline" />
        <div className="mx-auto h-2 w-2 bg-outline" />
      </div>
    </div>
  );
}
