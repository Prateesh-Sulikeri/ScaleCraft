/**
 * Shared shape every engine (validation, deep check, and eventually
 * simulation - see .claude/docs/pending-simulation-engine.md) implements.
 * `TConfig` is `void` for engines that need no settings (validation);
 * `signal` is optional since only network-backed engines can be aborted.
 */
export interface Engine<TInput, TConfig, TResult> {
  readonly id: string;
  readonly label: string;
  run(input: TInput, config: TConfig, signal?: AbortSignal): Promise<TResult>;
}
