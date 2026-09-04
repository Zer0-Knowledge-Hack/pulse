import { Composition } from "remotion";
import { PulseIconStill, PulseLockupStill } from "./PulseStills";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="PulseLockup"
        component={PulseLockupStill}
        durationInFrames={1}
        fps={30}
        width={1290}
        height={360}
      />
      <Composition
        id="PulseIcon"
        component={PulseIconStill}
        durationInFrames={1}
        fps={30}
        width={1024}
        height={1024}
      />
    </>
  );
}
