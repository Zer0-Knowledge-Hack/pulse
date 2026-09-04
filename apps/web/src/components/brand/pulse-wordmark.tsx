import { PulsePersistMark } from "./pulse-persist-mark";

export type PulseLockup = "trace" | "graded" | "harmonic" | "ring" | "persist";

export function PulseWordmark({
  variant = "persist",
  className,
}: {
  variant?: PulseLockup;
  className?: string;
}) {
  if (variant === "persist") {
    return <PulsePersistMark className={`pulse-svg ${className ?? ""}`} />;
  }
  return <AnalogArchive cut={variant} className={className} />;
}

function AnalogArchive({
  cut,
  className,
}: {
  cut: Exclude<PulseLockup, "persist">;
  className?: string;
}) {
  const wave =
    cut === "harmonic"
      ? "M40 26C48 26 52 50 68 50C78 50 90 7 102 7C110 7 122 50 138 50C150 50 158 28 174 28"
      : "M40 26c8 0 12 24 28 24s20-38 34-38 20 38 36 38 16-22 30-22";
  const holeFilled = cut !== "ring";
  const phosphor = "#F0B90B";

  return (
    <svg
      role="img"
      aria-label="pulse"
      viewBox="0 0 258 68"
      fill="none"
      className={`pulse-svg ${className ?? ""}`}
    >
      {cut === "graded" ? (
        <>
          <circle cx="68" cy="50" r="3.4" fill={phosphor} />
          <circle cx="102" cy="8" r="3.8" fill={phosphor} />
          <circle cx="138" cy="50" r="3.4" fill={phosphor} />
        </>
      ) : null}
      <path d="M16 8v52" stroke={phosphor} strokeWidth={5.5} strokeLinecap="round" />
      <circle
        cx="28"
        cy="24"
        r="12.5"
        fill={holeFilled ? phosphor : "none"}
        stroke={phosphor}
        strokeWidth={holeFilled ? 0 : 5.5}
      />
      <path
        d={wave}
        stroke={phosphor}
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="206"
        cy="36"
        r="16"
        stroke={phosphor}
        strokeWidth={5.5}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="84 16"
        strokeDashoffset={10}
      />
      <path d="M190 36h20" stroke={phosphor} strokeWidth={5.5} strokeLinecap="round" />
      <circle cx="236" cy="48" r="3.6" fill={phosphor} opacity={0.75} />
    </svg>
  );
}

export const PULSE_LOCKUP_SPECIMENS: {
  id: PulseLockup;
  title: string;
  why: string;
}[] = [
  {
    id: "persist",
    title: "Persist — locked cut",
    why: "Short afterglow of the last sweep. This is the product mark: SVG + PNG + ICO in public/product/.",
  },
  {
    id: "trace",
    title: "Trace — archive",
    why: "Phosphor core without the ghost sweep.",
  },
  {
    id: "graded",
    title: "Graded — archive",
    why: "Intensity dots at peaks. Not the ship cut.",
  },
  {
    id: "harmonic",
    title: "Harmonic — archive",
    why: "Sharper crest. Not the ship cut.",
  },
  {
    id: "ring",
    title: "Ring — archive",
    why: "Hollow p-spot. Not the ship cut.",
  },
];
