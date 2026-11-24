import type { WISLAudioProcessorConfig } from "../shared";

/**
 * Array of arrays for each input containing arrays for each channel.
 *
 * If an input is not connected, WebAudioInputs[name] will be empty.
 */
type WebAudioInputs = Float32Array[][];

/**
 * Array of arrays for each output containing arrays for each channel.
 *
 * If an output is not connected, WebAudioOutputs[name] will be empty.
 */
type WebAudioOutputs = Float32Array[][];

/**
 * If the parameter automation rate is a-rate, the array contains <block-size> values.
 *
 * If k-rate, the array only contains one value.
 */
type WebAudioParams = Record<string, Float32Array>;

interface WebAudioParamDescriptor {
  /**
   * Defaults to a-rate
   */
  automationRate?: AutomationRate;

  defaultValue?: number;
  maxValue?: number;
  minValue?: number;
  name: string;
}

export interface WebAudioOptions {
  numberOfInputs: number;
  numberOfOutputs: number;

  /**
   * Length must match numberOfOutputs
   */
  outputChannelCount?: number[];

  /**
   * Initial values of each parameter
   */
  parameterData?: Record<string, number>;

  /**
   * Data passed from AudioWorkletNode to the audio thread
   */
  processorOptions?: unknown;
}

export type WISLInputs<T> = { [K in keyof T]: Float32Array[] };
export type WISLOutputs<T> = { [K in keyof T]: Float32Array[] };
export type WISLParams<T> = { [K in keyof T]: Float32Array };
export type WISLProcessArgs<C extends WISLAudioProcessorConfig> = {
  inputs: WISLInputs<C["inputs"]>;
  outputs: WISLOutputs<C["outputs"]>;
  params: WISLParams<C["params"]>;
};

export const isConnected = (connection: Float32Array[]) => connection.length > 0;

export abstract class BaseWISLAudioProcessor<
  C extends WISLAudioProcessorConfig = WISLAudioProcessorConfig,
> extends AudioWorkletProcessor {
  static readonly config: WISLAudioProcessorConfig;

  static get parameterDescriptors(): WebAudioParamDescriptor[] {
    return Object.entries(this.config.params ?? {}).map(([name, info]) => ({
      automationRate: info.automationRate,
      defaultValue: info.defaultValue,
      maxValue: info.max,
      minValue: info.min,
      name,
    }));
  }

  private inputIndexMap: string[];
  private outputIndexMap: string[];
  private processArgs: WISLProcessArgs<C>;

  constructor(options: WebAudioOptions) {
    super(options);

    // Config must be set statically via createWISLAudioProcessor() and looked up here.
    // Cannot set in constructor because web audio API relies on static parameterDescriptors().
    const config = (this.constructor as typeof BaseWISLAudioProcessor).config as C;

    this.processArgs = {
      inputs: {} as WISLInputs<C["inputs"]>,
      outputs: {} as WISLOutputs<C["outputs"]>,
      params: {} as WISLParams<C["params"]>,
    };

    const inputEntries = Object.entries(config.inputs ?? {});
    this.inputIndexMap = new Array<string>(inputEntries.length);
    for (const [name, info] of inputEntries) {
      (this.processArgs.inputs as Record<string, unknown>)[name] = new Float32Array([]);
      this.inputIndexMap[info.index] = name;
    }

    const outputEntries = Object.entries(config.outputs ?? {});
    this.outputIndexMap = new Array<string>(outputEntries.length);
    for (const [name, info] of outputEntries) {
      (this.processArgs.outputs as Record<string, unknown>)[name] = new Float32Array([]);
      this.outputIndexMap[info.index] = name;
    }
  }

  process(inputs: WebAudioInputs, outputs: WebAudioOutputs, params: WebAudioParams): boolean {
    for (let i = 0; i < inputs.length; i++) {
      (this.processArgs.inputs as Record<string, unknown>)[this.inputIndexMap[i]] = inputs[i];
    }
    for (let i = 0; i < outputs.length; i++) {
      (this.processArgs.outputs as Record<string, unknown>)[this.outputIndexMap[i]] = outputs[i];
    }
    (this.processArgs.params as Record<string, unknown>) = params;

    this.wislProcess(this.processArgs);
    return true;
  }

  abstract wislProcess(args: WISLProcessArgs<C>): void;
}

export function createWISLAudioProcessor<const C extends WISLAudioProcessorConfig>(config: C) {
  abstract class ConfiguredWISLAudioProcessor extends BaseWISLAudioProcessor<C> {
    static override readonly config: C = config;
  }

  return ConfiguredWISLAudioProcessor;
}

export const registerWISLProcessor = <
  // Capture the specific constructor type being passed in
  TProcessor extends {
    readonly config: WISLAudioProcessorConfig;
    new (options: WebAudioOptions): InstanceType<TProcessor>;
  },
>(
  processorConstructor: TProcessor,
) => {
  // Fully safe! TypeScript extracts the literal type 'C' straight from the class static property
  const config = processorConstructor.config;

  // @ts-expect-error registerProcessor accessed in the AudioWorkletGlobalScope
  registerProcessor(config.name, processorConstructor);
};
