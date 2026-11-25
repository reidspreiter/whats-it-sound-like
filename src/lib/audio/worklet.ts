import type { FFTSize, WISLAudioProcessorConfig } from "./shared";

import { WISLAnalyzerNode } from "./analyzer";

const ANALYZE_ALL_CHANNELS_ID = -1;

export interface AnalyzerOptions {
  channel?: number;
  fftSize?: FFTSize;
}

type OutputAnalyzers<TProcessorConfig extends WISLAudioProcessorConfig> = Partial<
  Record<
    keyof TProcessorConfig["outputs"],
    { analyzers: Record<number, WISLAnalyzerNode>; splitter?: ChannelSplitterNode }
  >
>;

export class ProcessorWorkletNode<
  TProcessorConfig extends WISLAudioProcessorConfig = WISLAudioProcessorConfig,
> extends AudioWorkletNode {
  private config: WISLAudioProcessorConfig;
  private outputAnalyzers: OutputAnalyzers<TProcessorConfig> = {};

  constructor(context: BaseAudioContext, config: WISLAudioProcessorConfig) {
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

    super(context, config.name, options);

    this.config = config;
  }

  /**
   * Get an analyzer for a specific output.
   * @param name The name of the output
   * @param options Channel to monitor and FFT size. Defaults to monitor all channels with FFT size 2048. First channel is `1`
   */
  getOutputAnalyzer(
    name: keyof TProcessorConfig["outputs"] & string,
    options?: AnalyzerOptions,
  ): null | WISLAnalyzerNode {
    const channel = options?.channel ?? ANALYZE_ALL_CHANNELS_ID;

    const analyzer = this.outputAnalyzers[name]?.analyzers[channel];
    if (analyzer != null) {
      return analyzer;
    }

    return this.createOutputAnalyzer(name, options);
  }

  setParamValue(name: keyof TProcessorConfig["params"], value: number) {
    const param = this.parameters.get(String(name));
    if (param !== undefined) {
      param.value = value;
    }
  }

  private createOutputAnalyzer(
    name: keyof TProcessorConfig["outputs"] & string,
    options?: AnalyzerOptions,
  ): null | WISLAnalyzerNode {
    if (options?.channel != null && options?.channel < 1) {
      console.error(
        `Error creating alayzer: provided channel (${options?.channel}) must not be less than 1`,
      );
      return null;
    }

    const channel = options?.channel ? options.channel - 1 : ANALYZE_ALL_CHANNELS_ID;

    if (!(name in this.config.outputs)) {
      console.error(`Error creating analyzer: invalid output '${name}'`);
      return null;
    }

    const outputInfo = this.config.outputs[name];

    if (channel != ANALYZE_ALL_CHANNELS_ID && channel > outputInfo.channelCount - 1) {
      console.error(
        `Error creating analyser: invalid channel '${channel + 1}',  number of channels = ${outputInfo.channelCount}`,
      );
      return null;
    }

    this.outputAnalyzers[name] ??= { analyzers: {} };
    const analyzer = new WISLAnalyzerNode(this.context, { fftSize: options?.fftSize ?? 2048 });

    if (channel !== ANALYZE_ALL_CHANNELS_ID) {
      // To analyze a specific channel, we need to connect a splitter
      if (this.outputAnalyzers[name]?.splitter === undefined) {
        const splitter = new ChannelSplitterNode(this.context, {
          numberOfOutputs: outputInfo.channelCount,
        });
        this.connect(splitter, outputInfo.index);

        this.outputAnalyzers[name].splitter = splitter;
      }

      this.outputAnalyzers[name].splitter.connect(analyzer, channel);
    } else {
      this.connect(analyzer, outputInfo.index);
    }

    this.outputAnalyzers[name].analyzers[channel] = analyzer;

    return analyzer;
  }
}
