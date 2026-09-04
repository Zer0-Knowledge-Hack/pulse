import type { CSSProperties } from "react";
import {
  PERSIST_OPACITY,
  PERSIST_SHIFT,
  PHOSPHOR,
  PULSE_BAR,
  PULSE_DOT,
  PULSE_E,
  PULSE_HOLE,
  PULSE_MARK_VIEWBOX,
  PULSE_STEM,
  PULSE_VIEWBOX,
  PULSE_WAVE,
  STROKE,
} from "./pulse-geometry";

type PulseMarkKind = "lockup" | "mark";

export function PulsePersistMark({
  kind = "lockup",
  className,
  style,
}: {
  kind?: PulseMarkKind;
  className?: string;
  style?: CSSProperties;
}) {
  const bloomId = kind === "mark" ? "pulse-bloom-mark" : "pulse-bloom";
  const viewBox = kind === "mark" ? PULSE_MARK_VIEWBOX : PULSE_VIEWBOX;

  return (
    <svg
      role="img"
      aria-label="pulse"
      viewBox={viewBox}
      fill="none"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id={bloomId}
          x="-20%"
          y="-40%"
          width="140%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.35" result="glow" />
          <feColorMatrix
            in="glow"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.45 0"
            result="soft"
          />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${bloomId})`}>
        {kind === "lockup" ? (
          <path
            d={PULSE_WAVE}
            stroke={PHOSPHOR}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={PERSIST_OPACITY}
            transform={`translate(0 ${PERSIST_SHIFT})`}
          />
        ) : (
          <circle
            cx={PULSE_HOLE.cx}
            cy={PULSE_HOLE.cy + PERSIST_SHIFT}
            r={PULSE_HOLE.r}
            fill={PHOSPHOR}
            opacity={PERSIST_OPACITY}
          />
        )}
        <path
          d={PULSE_STEM}
          stroke={PHOSPHOR}
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        <circle
          cx={PULSE_HOLE.cx}
          cy={PULSE_HOLE.cy}
          r={PULSE_HOLE.r}
          fill={PHOSPHOR}
        />
        {kind === "lockup" ? (
          <>
            <path
              d={PULSE_WAVE}
              stroke={PHOSPHOR}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={PULSE_E.cx}
              cy={PULSE_E.cy}
              r={PULSE_E.r}
              stroke={PHOSPHOR}
              strokeWidth={STROKE}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="84 16"
              strokeDashoffset={10}
            />
            <path
              d={PULSE_BAR}
              stroke={PHOSPHOR}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
            <circle
              cx={PULSE_DOT.cx}
              cy={PULSE_DOT.cy}
              r={PULSE_DOT.r}
              fill={PHOSPHOR}
              opacity={0.75}
            />
          </>
        ) : null}
      </g>
    </svg>
  );
}
