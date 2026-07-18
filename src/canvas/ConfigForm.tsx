"use client";

import { useEffect } from "react";
import { useForm, useWatch, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ComponentDefinition } from "@/content/components/types";

type ConfigFormProps = {
  definition: ComponentDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
};

/**
 * Derives its fields from `definition.configSchema` at runtime — one Zod
 * schema drives both this form and the validation the engine would apply,
 * per .claude/docs/TECH_STACK.md ("reuse the same schema for the panel form
 * and for validation"). Only handles the flat primitive field shapes our
 * current components use (enum/number/boolean/string); a nested object or
 * array field would need a real recursive renderer — not needed yet.
 *
 * Mount this keyed by node id (see NodeConfigPopover) so switching the selected
 * node gets a fresh form instead of stale defaultValues.
 */
export function ConfigForm({ definition, value, onChange }: ConfigFormProps) {
  const schema = definition.configSchema as unknown as z.ZodType<Record<string, unknown>>;
  const shape = schema instanceof z.ZodObject ? schema.shape : null;

  const {
    register,
    control,
    formState: { isValid },
  } = useForm<Record<string, unknown>>({
    // zod v4's resolver generics don't reconcile with a schema type-erased to
    // an arbitrary component's config shape — this is inherently dynamic, a
    // static type here would be a fiction.
    resolver: zodResolver(schema as never),
    defaultValues: value as Record<string, unknown>,
    mode: "onChange",
  });

  const watched = useWatch({ control });
  const watchedKey = JSON.stringify(watched);

  useEffect(() => {
    if (isValid) onChange(watched);
    // watched is re-created every render; comparing its serialized form
    // keeps this from firing on every keystroke's intermediate renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedKey, isValid]);

  if (!shape || Object.keys(shape).length === 0) {
    return <p className="text-sm text-foreground/60">This component has no configuration options.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(shape).map(([key, fieldSchema]) => (
        <ConfigField key={key} name={key} schema={fieldSchema as z.ZodType} register={register} />
      ))}
    </div>
  );
}

function ConfigField({
  name,
  schema,
  register,
}: {
  name: string;
  schema: z.ZodType;
  register: UseFormRegister<Record<string, unknown>>;
}) {
  // camelCase -> "Camel Case": was a no-op label fix while every config field
  // happened to be one word (instances, algorithm, engine) — the new
  // multi-word fields (ttlSeconds, replicationLagBudgetMs, ...) made the
  // gap actually visible, so this now inserts spaces before each hump.
  const label = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());

  if (schema instanceof z.ZodEnum) {
    return (
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground/60">{label}</span>
        <select
          {...register(name)}
          className="rounded border border-border bg-background px-2 py-1.5 font-mono text-sm"
        >
          {schema.options.map((option: string | number) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (schema instanceof z.ZodNumber) {
    return (
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground/60">{label}</span>
        <input
          type="number"
          min={schema.minValue ?? undefined}
          max={schema.maxValue ?? undefined}
          {...register(name, { valueAsNumber: true })}
          className="rounded border border-border bg-background px-2 py-1.5 font-mono text-sm"
        />
      </label>
    );
  }

  if (schema instanceof z.ZodBoolean) {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register(name)} className="h-4 w-4" />
        <span className="text-foreground/60">{label}</span>
      </label>
    );
  }

  // ZodString and anything else we don't have a dedicated control for yet.
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-foreground/60">{label}</span>
      <input
        type="text"
        {...register(name)}
        className="rounded border border-border bg-background px-2 py-1.5 font-mono text-sm"
      />
    </label>
  );
}
