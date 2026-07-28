"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Lock, X } from "lucide-react";
import { providers } from "@/ai/providers";
import { testConnection } from "@/ai/run-deep-check";
import type { AiSettings } from "@/ai/settings";
import type { AiProviderId } from "@/ai/providers";

const CUSTOM_MODEL_OPTION = "__custom__";

type FormValues = {
  providerId: AiProviderId;
  model: string;
  apiKey: string;
  baseUrl: string;
  depth: AiSettings["depth"];
  tone: AiSettings["tone"];
  level: AiSettings["level"];
};

type AiSettingsModalProps = {
  settings: AiSettings;
  onSave: (settings: AiSettings) => void;
  onClose: () => void;
};

const inputClass = "rounded border border-border bg-background px-2 py-1.5 text-sm";

const providerOrder: AiProviderId[] = ["anthropic", "openai", "google", "xai", "openai-compatible"];

type TestState = "idle" | "testing" | { status: "ok" } | { status: "error"; message: string };

/**
 * Provider/model/key + the three depth/tone/level knobs — deliberately not
 * "many settings" (§10.2). `enabled` isn't a field the user toggles
 * directly; it's derived from whether a key was actually entered at save
 * time, per "absent by default until a key is saved" (§4.3).
 */
export function AiSettingsModal({ settings, onSave, onClose }: AiSettingsModalProps) {
  const { register, handleSubmit, watch, getValues, setValue } = useForm<FormValues>({
    defaultValues: {
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
    () => !providers[settings.providerId].suggestedModels.includes(settings.model),
  );

  const providerId = watch("providerId");

  useEffect(() => {
    const suggested = providers[providerId].suggestedModels;
    if (suggested.length === 0) {
      setCustomModel(true);
      return;
    }
    if (!suggested.includes(getValues("model"))) {
      setCustomModel(false);
      setValue("model", providers[providerId].defaultModel || suggested[0]);
    }
    // Only re-derive when the provider changes — re-running on every model
    // keystroke would fight the user's own typing in custom mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  function toAiSettings(values: FormValues): AiSettings {
    const apiKey = values.apiKey.trim();
    return {
      id: "default",
      enabled: apiKey.length > 0,
      providerId: values.providerId,
      model: values.model.trim() || providers[values.providerId].defaultModel,
      apiKey,
      depth: values.depth,
      tone: values.tone,
      level: values.level,
      ...(values.providerId === "openai-compatible" ? { baseUrl: values.baseUrl.trim() } : {}),
    };
  }

  const onSubmit = handleSubmit((values) => {
    onSave(toAiSettings(values));
  });

  const handleTestConnection = async () => {
    setTestState("testing");
    const result = await testConnection(toAiSettings(getValues()));
    setTestState(result.status === "ok" ? { status: "ok" } : { status: "error", message: result.message });
  };

  return (
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[var(--z-modal)] flex max-h-[85vh] w-[420px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">AI Settings</h2>
          <button onClick={onClose} aria-label="Close" className="text-foreground/50 hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 overflow-y-auto p-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/60">Provider</span>
            <select {...register("providerId")} aria-label="Provider" className={inputClass}>
              {providerOrder.map((id) => (
                <option key={id} value={id}>
                  {providers[id].label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/60">Model</span>
            {providers[providerId].suggestedModels.length > 0 && (
              <select
                aria-label="Model"
                className={inputClass}
                value={customModel ? CUSTOM_MODEL_OPTION : watch("model")}
                onChange={(e) => {
                  if (e.target.value === CUSTOM_MODEL_OPTION) {
                    setCustomModel(true);
                    return;
                  }
                  setCustomModel(false);
                  setValue("model", e.target.value);
                }}
              >
                {providers[providerId].suggestedModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value={CUSTOM_MODEL_OPTION}>Custom…</option>
              </select>
            )}
            {(customModel || providers[providerId].suggestedModels.length === 0) && (
              <input
                {...register("model")}
                aria-label={
                  providers[providerId].suggestedModels.length > 0 ? "Custom model" : "Model"
                }
                placeholder={providers[providerId].defaultModel || "Model ID"}
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
              onClick={onClose}
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
      </div>
    </>
  );
}
