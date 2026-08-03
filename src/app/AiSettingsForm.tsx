"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Lock } from "lucide-react";
import type { AiProviderId } from "@/engines";
import { providersMetadata } from "@/engines";
import type { AiSettings } from "@/ai/settings";
import type { AiProfileDraft } from "@/ai/profiles";

const CUSTOM_MODEL_OPTION = "__custom__";

type FormValues = {
  name: string;
  providerId: AiProviderId;
  model: string;
  apiKey: string;
  baseUrl: string;
  depth: AiSettings["depth"];
  tone: AiSettings["tone"];
  level: AiSettings["level"];
};

type AiSettingsFormProps = {
  settings: AiProfileDraft;
  onSave: (settings: AiProfileDraft) => void;
  onCancel: () => void;
};

const inputClass = "rounded border border-border bg-background px-2 py-1.5 text-sm";

const providerOrder: AiProviderId[] = ["anthropic", "openai", "google", "xai", "openai-compatible"];

type TestState = "idle" | "testing" | { status: "ok" } | { status: "error"; message: string };

/**
 * Plain form, no positioning/backdrop of its own — embedded inside
 * AiProfilesView.tsx's edit view (itself inside DeepCheckPanel's profiles
 * view) rather than floating as a standalone modal. Previously
 * `AiSettingsModal`, then a single always-open settings form; now a
 * per-profile editor, one `AiProfile` in, one `AiProfileDraft` out — field
 * logic otherwise unchanged.
 *
 * A name plus provider/model/key and the three depth/tone/level knobs —
 * deliberately not "many settings" (§10.2). Usability (does this profile
 * have a usable key) is derived by the caller from the saved draft's
 * `apiKey`, not a field this form manages directly.
 */
export function AiSettingsForm({ settings, onSave, onCancel }: AiSettingsFormProps) {
  const { register, control, handleSubmit, getValues, setValue } = useForm<FormValues>({
    defaultValues: {
      name: settings.name,
      providerId: settings.providerId,
      model: settings.model,
      apiKey: settings.apiKey,
      baseUrl: settings.baseUrl ?? "",
      depth: settings.depth,
      tone: settings.tone,
      level: settings.level,
    },
  });
  const [testState, setTestState] = useState<TestState>("idle");
  // A real <select> (suggested models + "Custom…"), not the native
  // <datalist> this used to be — the datalist popup only ever showed 2-3
  // barely-visible browser-styled suggestions, which read as broken rather
  // than sparse-but-intentional. `defaultModel: ""` for openai-compatible
  // (no suggestions make sense for an arbitrary self-hosted endpoint)
  // starts it in custom mode unconditionally.
  const [customModel, setCustomModel] = useState(
    () => !providersMetadata[settings.providerId].suggestedModels.includes(settings.model),
  );

  // useWatch, not form.watch() — the latter returns a plain function call
  // React Compiler can't verify is safe to memoize (hence the "incompatible
  // library" bailout warning this used to trigger); useWatch is a proper
  // hook react-hook-form ships specifically for this.
  const providerId = useWatch({ control, name: "providerId" });
  const model = useWatch({ control, name: "model" });

  // Was a useEffect keyed on `providerId`, which ran a spurious extra pass
  // on mount (effects always fire once after the first render regardless of
  // deps) — for a profile whose saved model was already legitimately custom
  // (not in the new provider's suggested list — the very state that mount
  // started in), that stray pass would silently flip back out of custom
  // mode and overwrite it with the provider's default. Driving this from
  // the Provider select's own onChange fixes that: it only ever runs on a
  // real, user-initiated provider switch, never on mount.
  const handleProviderChange = (e: { target: { value: string } }) => {
    const nextProviderId = e.target.value as AiProviderId;
    const suggested = providersMetadata[nextProviderId].suggestedModels;
    if (suggested.length === 0) {
      setCustomModel(true);
      return;
    }
    if (!suggested.includes(getValues("model"))) {
      setCustomModel(false);
      setValue("model", providersMetadata[nextProviderId].defaultModel || suggested[0]);
    }
  };

  function toProfileDraft(values: FormValues): AiProfileDraft {
    return {
      name: values.name.trim() || "Untitled profile",
      providerId: values.providerId,
      model: values.model.trim() || providersMetadata[values.providerId].defaultModel,
      apiKey: values.apiKey.trim(),
      depth: values.depth,
      tone: values.tone,
      level: values.level,
      ...(values.providerId === "openai-compatible" ? { baseUrl: values.baseUrl.trim() } : {}),
    };
  }

  const onSubmit = handleSubmit((values) => {
    onSave(toProfileDraft(values));
  });

  const handleTestConnection = async () => {
    setTestState("testing");
    // Dynamic import, not getEngine() — testConnection is a settings-
    // validation utility, not the generic Engine interface (see
    // src/engines/deep-check/index.ts).
    const { testConnection } = await import("@/engines/deep-check");
    const result = await testConnection(toProfileDraft(getValues()));
    setTestState(result.status === "ok" ? { status: "ok" } : { status: "error", message: result.message });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground/60">Profile name</span>
        <input
          {...register("name")}
          aria-label="Profile name"
          placeholder="e.g. Work Anthropic key"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground/60">Provider</span>
        <select
          {...register("providerId", { onChange: handleProviderChange })}
          aria-label="Provider"
          className={inputClass}
        >
          {providerOrder.map((id) => (
            <option key={id} value={id}>
              {providersMetadata[id].label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground/60">Model</span>
        {providersMetadata[providerId].suggestedModels.length > 0 && (
          <select
            aria-label="Model"
            className={inputClass}
            value={customModel ? CUSTOM_MODEL_OPTION : model}
            onChange={(e) => {
              if (e.target.value === CUSTOM_MODEL_OPTION) {
                setCustomModel(true);
                return;
              }
              setCustomModel(false);
              setValue("model", e.target.value);
            }}
          >
            {providersMetadata[providerId].suggestedModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value={CUSTOM_MODEL_OPTION}>Custom…</option>
          </select>
        )}
        {(customModel || providersMetadata[providerId].suggestedModels.length === 0) && (
          <input
            {...register("model")}
            aria-label={providersMetadata[providerId].suggestedModels.length > 0 ? "Custom model" : "Model"}
            placeholder={providersMetadata[providerId].defaultModel || "Model ID"}
            className={inputClass}
          />
        )}
      </label>

      {providerId === "openai-compatible" && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground/60">Base URL</span>
          <input
            {...register("baseUrl")}
            aria-label="Base URL"
            placeholder="http://localhost:11434/v1"
            className={inputClass}
          />
        </label>
      )}

      {/* Required, unmissable disclosure per §10.2 — sits directly above
       * the key field, not buried as a footnote. */}
      <div className="flex items-start gap-2 rounded border border-border bg-background px-2.5 py-2 text-xs text-foreground/70">
        <Lock size={13} className="mt-0.5 shrink-0" />
        <span>
          Your API key is stored in this browser&apos;s IndexedDB and is never sent to
          ScaleCraft&apos;s servers.
        </span>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground/60">API Key</span>
        <input
          {...register("apiKey")}
          aria-label="API Key"
          type="password"
          autoComplete="off"
          className={inputClass}
        />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-foreground/60">Depth</span>
          <select {...register("depth")} aria-label="Depth" className={inputClass}>
            <option value="brief">Brief</option>
            <option value="standard">Standard</option>
            <option value="deep">Deep</option>
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-foreground/60">Tone</span>
          <select {...register("tone")} aria-label="Tone" className={inputClass}>
            <option value="direct">Direct</option>
            <option value="socratic">Socratic</option>
            <option value="encouraging">Encouraging</option>
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-foreground/60">Level</span>
          <select {...register("level")} aria-label="Level" className={inputClass}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-3">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testState === "testing"}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
        >
          {testState === "testing" ? "Testing…" : "Test Connection"}
        </button>
        {typeof testState === "object" && testState.status === "ok" && (
          <span className="text-sm text-state-valid">Connected</span>
        )}
        {typeof testState === "object" && testState.status === "error" && (
          <span className="text-sm text-state-error">{testState.message}</span>
        )}
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-border"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md border border-border bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
        >
          Save
        </button>
      </div>
    </form>
  );
}
