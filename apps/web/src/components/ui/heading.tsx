import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h1 className={cn("page-title", className)}>{children}</h1>;
}

export function SectionTitle({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <h2 id={id} className={cn("section-title", className)}>
      {children}
    </h2>
  );
}

export function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("lede", className)}>{children}</p>;
}

export function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("meta", className)}>{children}</p>;
}
