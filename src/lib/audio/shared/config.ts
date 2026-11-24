import type {
  ReservedParamNames,
  WISLAudioInputInfo,
  WISLAudioOutputInfo,
  WISLAudioParamInfo,
  WISLAudioProcessorConfig,
} from ".";

type RejectReservedParamName<TKey extends string> = TKey extends ReservedParamNames
  ? ["Error: Parameter name is reserved", TKey]
  : TKey;

class ProcessorConfigBuilder<
  TInputs extends string = never,
  TOutputs extends string = never,
  TParams extends string = never,
> {
  private data: WISLAudioProcessorConfig = {
    inputs: {},
    name: "",
    outputs: {},
    params: {},
    url: "",
  };

  constructor(name?: string, url?: string, existingData?: WISLAudioProcessorConfig) {
    if (existingData) {
      this.data = existingData;
    } else if (name && url) {
      this.data.name = name;
      this.data.url = url;
    }
  }

  /**
   * Add an input to the processor
   * @param key The name of the input
   */
  addInput<const TKey extends string>(key: TKey) {
    const inputIndex = Object.keys(this.data.inputs).length;
    const nextInputs = { ...this.data.inputs, [key]: { index: inputIndex } as WISLAudioInputInfo };

    return new ProcessorConfigBuilder<TInputs | TKey, TOutputs, TParams>(undefined, undefined, {
      ...this.data,
      inputs: nextInputs,
    });
  }

  /**
   * Add an output to the processor
   * @param key The name of the output
   * @param config Optional configuration.
   * @param config.channelCount Number of channels the output supports. Defaults to 1
   */
  addOutput<const TKey extends string>(key: TKey, config?: { channelCount?: number }) {
    const outputIndex = Object.keys(this.data.outputs).length;
    const nextOutputs = {
      ...this.data.outputs,
      [key]: { channelCount: config?.channelCount ?? 1, index: outputIndex } as WISLAudioOutputInfo,
    };

    return new ProcessorConfigBuilder<TInputs, TKey | TOutputs, TParams>(undefined, undefined, {
      ...this.data,
      outputs: nextOutputs,
    });
  }

  /**
   * Add an audio parameter to the processor
   * @param key The name of the parameter
   * @param config Parameter configuration
   */
  addParam<const TKey extends string>(
    key: RejectReservedParamName<TKey>,
    config: WISLAudioParamInfo,
  ) {
    const nextParams = { ...this.data.params };

    if (typeof key === "string") {
      nextParams[key] = config;
    }

    return new ProcessorConfigBuilder<TInputs, TOutputs, TKey | TParams>(undefined, undefined, {
      ...this.data,
      params: nextParams,
    });
  }

  build(): WISLAudioProcessorConfig<TInputs, TOutputs, TParams> {
    return this.data;
  }
}

export const createProcessorConfig = (name: string, url: string) => {
  return new ProcessorConfigBuilder(name, url);
};
