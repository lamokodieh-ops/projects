import { useId } from "react";
import { cn } from "@/lib/cn";

const fieldClass =
  "w-full min-h-11 px-0 py-2.5 border-0 border-b border-navy/15 bg-transparent text-ink text-[0.9rem] rounded-none focus:border-navy/50 focus:outline-none focus-visible:border-navy placeholder:text-navy/30";

function fieldErrorId(inputId: string) {
  return `${inputId}-error`;
}

function mergeDescribedBy(...ids: Array<string | undefined>) {
  const merged = ids.filter(Boolean).join(" ");
  return merged || undefined;
}

export function Input({
  label,
  error,
  className,
  id,
  "aria-describedby": describedByProp,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const errorId = error ? fieldErrorId(inputId) : undefined;
  return (
    <div className={cn("max-w-md", className)}>
      {label && (
        <label htmlFor={inputId} className="block text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(fieldClass, error && "border-red")}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={mergeDescribedBy(describedByProp, errorId)}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-red">
          {error}
        </p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className,
  id,
  "aria-describedby": describedByProp,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const errorId = error ? fieldErrorId(inputId) : undefined;
  return (
    <div className={cn("max-w-2xl", className)}>
      {label && (
        <label htmlFor={inputId} className="block text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-2">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(fieldClass, "min-h-[100px] resize-y", error && "border-red")}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={mergeDescribedBy(describedByProp, errorId)}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-red">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  className,
  children,
  id,
  "aria-describedby": describedByProp,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const errorId = error ? fieldErrorId(inputId) : undefined;
  return (
    <div className={cn("max-w-md", className)}>
      {label && (
        <label htmlFor={inputId} className="block text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-2">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(fieldClass, error && "border-red")}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={mergeDescribedBy(describedByProp, errorId)}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-red">
          {error}
        </p>
      )}
    </div>
  );
}
