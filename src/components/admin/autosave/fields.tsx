"use client";

import { useId } from "react";
import { adminInputClass } from "../form-kit";
import { cn } from "@/lib/utils";
import { SaveStatus } from "./save-status";
import { useAutosaveField, type AutosaveResult, type SaveState } from "./use-autosave-field";

function FieldHeader({
  htmlFor,
  label,
  status,
}: {
  htmlFor: string;
  label: string;
  status: SaveState;
}) {
  return (
    <span className="flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <SaveStatus status={status} />
    </span>
  );
}

export function AutosaveText({
  label,
  value,
  onSave,
  multiline,
  rows = 3,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onSave: (v: string) => Promise<AutosaveResult>;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  placeholder?: string;
}) {
  const id = useId();
  const { value: v, setValue, status, flush } = useAutosaveField({
    initialValue: value,
    save: onSave,
  });
  return (
    <div className="grid gap-1.5">
      <FieldHeader htmlFor={id} label={label} status={status} />
      {multiline ? (
        <textarea
          id={id}
          value={v}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onBlur={flush}
          className={cn(adminInputClass, "resize-y")}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={v}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onBlur={flush}
          className={adminInputClass}
        />
      )}
      {hint ? <span className="text-[0.7rem] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function AutosaveSelect({
  label,
  value,
  options,
  onSave,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onSave: (v: string) => Promise<AutosaveResult>;
}) {
  const id = useId();
  // delay 0: a select commits on the next tick after change (no typing pause).
  const { value: v, setValue, status } = useAutosaveField({
    initialValue: value,
    save: onSave,
    delay: 0,
  });
  return (
    <div className="grid gap-1.5">
      <FieldHeader htmlFor={id} label={label} status={status} />
      <select
        id={id}
        value={v}
        onChange={(e) => setValue(e.target.value)}
        className={adminInputClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AutosaveToggle({
  label,
  value,
  onSave,
}: {
  label: string;
  value: boolean;
  onSave: (v: boolean) => Promise<AutosaveResult>;
}) {
  const id = useId();
  const { value: v, setValue, status } = useAutosaveField({
    initialValue: value,
    save: onSave,
    delay: 0,
  });
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-background/60 px-3 py-2"
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <SaveStatus status={status} />
        <input
          id={id}
          type="checkbox"
          checked={v}
          onChange={(e) => setValue(e.target.checked)}
          className="size-4 accent-ring"
        />
      </span>
    </label>
  );
}

export function AutosaveTags({
  label,
  value,
  onSave,
  hint,
}: {
  label: string;
  value: string[];
  onSave: (v: string[]) => Promise<AutosaveResult>;
  hint?: string;
}) {
  const id = useId();
  // Edit as a comma-separated string; persist as a trimmed array.
  const { value: v, setValue, status, flush } = useAutosaveField({
    initialValue: value.join(", "),
    save: (raw) => onSave(raw.split(",").map((s) => s.trim()).filter(Boolean)),
  });
  return (
    <div className="grid gap-1.5">
      <FieldHeader htmlFor={id} label={label} status={status} />
      <input
        id={id}
        type="text"
        value={v}
        onChange={(e) => setValue(e.target.value)}
        onBlur={flush}
        className={adminInputClass}
      />
      {hint ? <span className="text-[0.7rem] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
