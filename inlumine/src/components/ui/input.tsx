import { cn } from "@/lib/cn";

const fieldClass =
  "w-full px-0 py-2.5 border-0 border-b border-navy/15 bg-transparent text-ink text-[0.9rem] rounded-none focus:border-navy/50 focus:outline-none focus:ring-0 placeholder:text-navy/30";

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const inputId = id || props.name;
  return (
    <div className={cn("max-w-md", className)}>
      {label && (
        <label htmlFor={inputId} className="block text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-2">
          {label}
        </label>
      )}
      <input id={inputId} className={cn(fieldClass, error && "border-red")} {...props} />
      {error && <p className="mt-2 text-xs text-red">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  const inputId = id || props.name;
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
      />
      {error && <p className="mt-2 text-xs text-red">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  className,
  children,
  id,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  const inputId = id || props.name;
  return (
    <div className={cn("max-w-md", className)}>
      {label && (
        <label htmlFor={inputId} className="block text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-2">
          {label}
        </label>
      )}
      <select id={inputId} className={cn(fieldClass, error && "border-red")} {...props}>
        {children}
      </select>
      {error && <p className="mt-2 text-xs text-red">{error}</p>}
    </div>
  );
}
