import type { WISLAudioProcessorConfig } from "./shared/shared";

export class ProcessorWorkletNode<
  TProcessorConfig extends WISLAudioProcessorConfig = WISLAudioProcessorConfig,
> extends AudioWorkletNode {
  private constructor(context: BaseAudioContext, name: string, options?: AudioWorkletNodeOptions) {
    super(context, name, options);
  }

  static fromConfig(context: BaseAudioContext, config: WISLAudioProcessorConfig) {
    const inputEntries = Object.entries(config.inputs);
    const outputEntries = Object.entries(config.outputs);

    const outputChannelCount = new Array<number>(outputEntries.length);

    for (const [_, info] of outputEntries) {
      outputChannelCount[info.index] = info.channelCount;
    }

    const options = {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
      numberOfInputs:
        inputEntries.length === 0 && outputEntries.length === 0 ? 1 : inputEntries.length,
      numberOfOutputs: outputEntries.length,
      outputChannelCount,
    } satisfies AudioWorkletNodeOptions;

    return new ProcessorWorkletNode(context, config.name, options);
  }

  setParamValue(name: keyof TProcessorConfig["params"], value: number) {
    const param = this.parameters.get(String(name));
    if (param !== undefined) {
      param.value = value;
    }
  }
}
