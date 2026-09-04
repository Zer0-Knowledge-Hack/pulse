const HORIZONTAL_MIN_PX = 97;

export function BnbChainLockup({
  className,
}: {
  className?: string;
}) {
  return (
    <img
      src="/brand/bnb-chain-logo-yellow.svg"
      alt="BNB Chain"
      width={140}
      height={25}
      className={className}
      style={{ minWidth: HORIZONTAL_MIN_PX, height: "auto" }}
    />
  );
}
