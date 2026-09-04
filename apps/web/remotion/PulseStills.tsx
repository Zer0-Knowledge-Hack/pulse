import { AbsoluteFill } from "remotion";
import { PulsePersistMark } from "../src/components/brand/pulse-persist-mark";
import { INK } from "../src/components/brand/pulse-geometry";

export function PulseLockupStill() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: INK,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "90%" }}>
        <PulsePersistMark
          kind="lockup"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
    </AbsoluteFill>
  );
}

export function PulseIconStill() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: INK,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "62%" }}>
        <PulsePersistMark
          kind="mark"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
    </AbsoluteFill>
  );
}
