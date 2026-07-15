"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Server, Trash2, X } from "lucide-react";
import { categoryLabel, categoryOrder } from "./category-colors";
import { iconMap } from "./icon-map";
import type { ComponentCategory } from "@/content/components/types";
import type { CustomComponentRecord, CustomFieldSpec } from "@/content/components/custom";

type FieldKind = "string" | "number" | "boolean" | "enum";

/** Flat internal editing shape — every possible sub-field present at once
 * (not a discriminated union) so the field-array rows don't need to swap
 * their whole shape when the user changes "kind" mid-edit; only `onSubmit`
 * below narrows each row down to the real CustomFieldSpec its kind implies. */
type FieldFormValue = {
  name: string;
  label: string;
  kind: FieldKind;
  defaultString: string;
  defaultNumber: number;
  defaultBoolean: boolean;
  /** Comma-separated; only meaningful when kind === "enum". */
  optionsText: string;
};

type FormValues = {
  label: string;
  category: ComponentCategory;
  icon: string;
  summary: string;
  docs: string;
  hasInput: boolean;
  hasOutput: boolean;
  fields: FieldFormValue[];
};

const EMPTY_FIELD: FieldFormValue = {
  name: "",
  label: "",
  kind: "string",
  defaultString: "",
  defaultNumber: 0,
  defaultBoolean: false,
  optionsText: "",
};

const inputClass = "rounded border border-border bg-background px-2 py-1.5 text-sm";

/** Reverses onSubmit's narrowing — used to prefill the form in edit mode.
 * The flat FieldFormValue shape holds every kind's sub-fields at once, so a
 * spec's own kind decides which slot its value lands in; the rest stay at
 * their harmless defaults. */
function specToFormValue(spec: CustomFieldSpec): FieldFormValue {
  return {
    name: spec.name,
    label: spec.label,
    kind: spec.kind,
    defaultString: spec.kind === "string" ? spec.default : "",
    defaultNumber: spec.kind === "number" ? spec.default : 0,
    defaultBoolean: spec.kind === "boolean" ? spec.default : false,
    optionsText: spec.kind === "enum" ? spec.options.join(", ") : "",
  };
}

type CreateComponentModalProps = {
  onClose: () => void;
  onSave: (record: CustomComponentRecord) => void;
  /** Present when editing an existing custom component — prefills the form
   * and keeps the original id on save instead of minting a new one. */
  initialRecord?: CustomComponentRecord;
};

/**
 * A user-created component (see content/components/custom.ts) isn't a new
 * node type — it's a new entry in the component registry, rendered by the
 * existing ComponentNode.tsx completely unchanged, and immediately
 * draggable from the palette / available in the pane right-click menu once
 * created (both read the store's customComponents list, merged with the
 * static registry). This form collects just enough to build a real
 * ComponentDefinition: identity (label/category/icon/summary/docs), port
 * presence, and a flat list of config fields — one generic input/output
 * port each (not multiple named ports), no nested config shapes.
 */
export function CreateComponentModal({ onClose, onSave, initialRecord }: CreateComponentModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { register, control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: initialRecord
      ? {
          label: initialRecord.label,
          category: initialRecord.category,
          icon: initialRecord.icon,
          summary: initialRecord.summary,
          docs: initialRecord.docs,
          hasInput: initialRecord.hasInput,
          hasOutput: initialRecord.hasOutput,
          fields: initialRecord.fields.map(specToFormValue),
        }
      : {
          label: "",
          category: "networking",
          icon: "server",
          summary: "",
          docs: "",
          hasInput: true,
          hasOutput: true,
          fields: [],
        },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "fields" });
  const selectedIcon = watch("icon");

  const onSubmit = handleSubmit((values) => {
    const label = values.label.trim();
    if (!label) {
      setError("Give it a name.");
      return;
    }

    const specs: CustomFieldSpec[] = [];
    for (const f of values.fields) {
      const name = f.name.trim();
      if (!name) {
        setError("Every config field needs a name.");
        return;
      }
      const base = { name, label: f.label.trim() || name };
      if (f.kind === "string") {
        specs.push({ kind: "string", ...base, default: f.defaultString });
      } else if (f.kind === "number") {
        specs.push({ kind: "number", ...base, default: f.defaultNumber });
      } else if (f.kind === "boolean") {
        specs.push({ kind: "boolean", ...base, default: f.defaultBoolean });
      } else {
        const options = f.optionsText
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
        if (options.length === 0) {
          setError(`"${name}" is a choice field but has no options.`);
          return;
        }
        specs.push({ kind: "enum", ...base, options, default: options[0] });
      }
    }

    setError(null);
    onSave({
      id: initialRecord?.id ?? `custom-${crypto.randomUUID()}`,
      category: values.category,
      label,
      icon: values.icon,
      summary: values.summary.trim() || label,
      docs: values.docs.trim() || values.summary.trim() || label,
      hasInput: values.hasInput,
      hasOutput: values.hasOutput,
      fields: specs,
    });
  });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[440px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{initialRecord ? "Edit component" : "New component"}</h2>
          <button onClick={onClose} aria-label="Close" className="text-foreground/50 hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 overflow-y-auto p-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/60">Label</span>
            <input {...register("label")} placeholder="e.g. Rate Limiter" className={inputClass} />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-foreground/60">Category</span>
              <select {...register("category")} className={inputClass}>
                {categoryOrder.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel[c]}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-foreground/60">Icon</span>
              <div className="grid max-h-24 grid-cols-7 gap-1 overflow-y-auto rounded border border-border bg-background p-1">
                {Object.entries(iconMap).map(([key, Icon]) => (
                  <button
                    type="button"
                    key={key}
                    aria-label={key}
                    onClick={() => setValue("icon", key)}
                    className={`flex h-6 w-6 items-center justify-center rounded ${
                      selectedIcon === key ? "bg-border text-foreground" : "text-foreground/50 hover:text-foreground"
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/60">Summary (shown on the canvas card)</span>
            <input {...register("summary")} placeholder="One short line" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/60">Docs</span>
            <textarea {...register("docs")} rows={3} placeholder="Longer explanation for the Docs panel" className={inputClass} />
          </label>

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("hasInput")} className="h-4 w-4" />
              <span className="text-foreground/60">Has input</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("hasOutput")} className="h-4 w-4" />
              <span className="text-foreground/60">Has output</span>
            </label>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Config fields
              </span>
              <button
                type="button"
                onClick={() => append(EMPTY_FIELD)}
                className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-foreground/70 hover:text-foreground"
              >
                <Plus size={12} />
                Add field
              </button>
            </div>

            {fields.map((field, index) => (
              <FieldRow key={field.id} index={index} register={register} watch={watch} onRemove={() => remove(index)} />
            ))}
          </div>

          {error && <p className="text-sm text-state-error">{error}</p>}

          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-md border border-border bg-panel px-3 py-2 text-sm font-medium hover:bg-border"
          >
            <Server size={14} />
            {initialRecord ? "Save changes" : "Create component"}
          </button>
        </form>
      </div>
    </>
  );
}

function FieldRow({
  index,
  register,
  watch,
  onRemove,
}: {
  index: number;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  watch: ReturnType<typeof useForm<FormValues>>["watch"];
  onRemove: () => void;
}) {
  const kind = watch(`fields.${index}.kind`);

  return (
    <div className="flex flex-col gap-2 rounded border border-border bg-background/50 p-2">
      <div className="flex items-center gap-2">
        <input
          {...register(`fields.${index}.name`)}
          placeholder="fieldName"
          className={`${inputClass} min-w-0 flex-1 font-mono`}
        />
        <select {...register(`fields.${index}.kind`)} className={inputClass}>
          <option value="string">Text</option>
          <option value="number">Number</option>
          <option value="boolean">Yes / No</option>
          <option value="enum">Choice</option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove field"
          className="shrink-0 text-foreground/40 hover:text-state-error"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <input
        {...register(`fields.${index}.label`)}
        placeholder="Label shown in the inspector (optional)"
        className={`${inputClass} w-full`}
      />

      {kind === "string" && (
        <input {...register(`fields.${index}.defaultString`)} placeholder="Default value" className={inputClass} />
      )}
      {kind === "number" && (
        <input
          type="number"
          {...register(`fields.${index}.defaultNumber`, { valueAsNumber: true })}
          placeholder="Default value"
          className={inputClass}
        />
      )}
      {kind === "boolean" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register(`fields.${index}.defaultBoolean`)} className="h-4 w-4" />
          <span className="text-foreground/60">Default on</span>
        </label>
      )}
      {kind === "enum" && (
        <input
          {...register(`fields.${index}.optionsText`)}
          placeholder="Options, comma-separated (first is the default)"
          className={inputClass}
        />
      )}
    </div>
  );
}
