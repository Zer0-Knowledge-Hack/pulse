import {
  PulseWordmark,
  PULSE_LOCKUP_SPECIMENS,
} from "@/components/brand/pulse-wordmark";

export function LockupsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 pb-24">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-accent">
        Analog instrument
      </p>
      <h1 className="text-xl font-semibold">pulse as a CRT trace</h1>
      <p className="mt-2 mb-8 max-w-xl text-sm text-muted">
        Analog here means a measuring tube, not a heartbeat tattoo. Persist is
        the locked cut — short afterglow of the last sweep. Header, favicon,
        and docs all use it.
      </p>
      <div className="grid gap-3">
        {PULSE_LOCKUP_SPECIMENS.map((spec) => (
          <article
            key={spec.id}
            className={
              spec.id === "persist"
                ? "border border-accent"
                : "border border-line"
            }
          >
            <p className="px-8 pt-6 font-mono text-[11px] uppercase tracking-wide text-muted">
              {spec.title}
            </p>
            <div className="pulse-crt mx-8 my-5 overflow-visible">
              <PulseWordmark variant={spec.id} />
            </div>
            <p className="px-8 pb-6 max-w-lg text-sm text-muted">{spec.why}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
