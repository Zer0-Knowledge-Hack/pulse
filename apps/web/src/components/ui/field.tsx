import {
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

const controlClass =
  "w-full rounded-2xl border bg-ink px-3 py-2.5 text-sm text-paper placeholder:text-muted transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-paper">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-xs text-danger"
        >
          <Icon icon={CircleAlert} className="mt-0.5 size-3.5" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function describedBy(hint?: string, error?: string, id?: string): string | undefined {
  const parts: string[] = [];
  if (error && id) parts.push(`${id}-error`);
  else if (hint && id) parts.push(`${id}-hint`);
  return parts.length ? parts.join(" ") : undefined;
}

export function TextField({
  id,
  label,
  hint,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, id)}
        className={cn(
          controlClass,
          "min-h-10 font-mono",
          error ? "border-danger" : "border-line",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, id)}
        className={cn(
          controlClass,
          "min-h-24 resize-y font-sans",
          error ? "border-danger" : "border-line",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  hint,
  error,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, id)}
        className={cn(
          controlClass,
          "min-h-10",
          error ? "border-danger" : "border-line",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
