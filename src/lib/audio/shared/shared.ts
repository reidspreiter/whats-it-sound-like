// This file should only contain types and implementations that can be imported by both the main and audio threads

// Web audio API identifies connections by index. We need a reliable way to map custom connection names to their indexes.
interface WISLAudioBufferInfo {
  index: number;
}

export interface WISLAudioInputInfo extends WISLAudioBufferInfo {}

export interface WISLAudioOutputInfo extends WISLAudioBufferInfo {
  channelCount: number;
}

export const FFTSizes = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192] as const;
export type FFTSize = (typeof FFTSizes)[number];

/**
 * List of reserved parameter names that nodes should not define
 */
export const reservedParamNames = ["processor"] as const;

/**
 * Reserved parameter names that nodes should not define
 */
export type ReservedParamNames = (typeof reservedParamNames)[number];

/**
 * - a-rate: parameter value updated every frame
 * - k-rate: parameter value updated every block
 */
export type AutomationRate = "a-rate" | "k-rate";

export interface DisplayConfig {
  /**
   * - `0`: linear (default, no effect)
   * - `< 0`: log of value using this base
   * - `> 0` this base to the power of value
   *
   * Step is applied before displayBase. Multiplier and offset are applied afterwards.
   */
  displayBase?: number;
  displayMultiplier?: number;

  displayOffset?: number;
  displayPrecision?: number;
  displayUnit?: string;
}

// This interface is very similar to Knob props and potentially other props in the future.
// A separate interface was intentionally used here to separate the audio thread from the main thread.
export interface WISLAudioParamInfo {
  automationRate?: AutomationRate;
  defaultValue: number;
  displayConfig: DisplayConfig;
  max: number;
  min: number;
  step?: number;
}

export interface WISLAudioProcessorConfig<
  TInputs extends string = string,
  TOutputs extends string = string,
  TParams extends string = string,
> {
  inputs: Record<TInputs, WISLAudioInputInfo>;
  name: string;
  outputs: Record<TOutputs, WISLAudioOutputInfo>;
  params: Record<TParams, WISLAudioParamInfo>;
  url: string;
}
