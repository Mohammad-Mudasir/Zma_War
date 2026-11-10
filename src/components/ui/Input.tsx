import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
};

/** Label + control + hint/error, wired together for screen readers. */
export function Field({ label, name, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${name}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm font-medium text-pomegranate-700">
          {error}
        </p>
      )}
    </div>
  );
}

const control =
  "block h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-base text-ink placeholder:text-muted/70 " +
  "focus-visible:border-pine-600 aria-[invalid=true]:border-pomegranate-600";

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
};

export function Input({ label, name, error, hint, className, ...props }: InputProps) {
  return (
    <Field label={label} name={name} error={error} hint={hint}>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={cn(control, className)}
        {...props}
      />
    </Field>
  );
}

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name"> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  options: ReadonlyArray<{ value: string | number; label: string }>;
};

export function Select({ label, name, error, hint, options, className, ...props }: SelectProps) {
  return (
    <Field label={label} name={name} error={error} hint={hint}>
      <select
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        className={cn(control, "pr-8", className)}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export { control as controlClass };
