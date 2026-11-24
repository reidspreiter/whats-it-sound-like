import type { WISLAudioProcessorConfig } from "./shared";

import { ProcessorWorkletNode } from "./worklet";

class AudioManager {
  get destination(): AudioNode {
    return this.globalGain;
  }
  private context: AudioContext;
  private globalGain: GainNode;

  private processors: Record<string, ProcessorWorkletNode>;

  constructor() {
    this.context = new AudioContext();
    this.globalGain = new GainNode(this.context, { gain: 1 });
    this.globalGain.connect(this.context.destination);
    this.processors = {};
  }

  public addConnection(
    sourceNodeID: string,
    targetNodeID: string,
    sourceName: string,
    targetName: string,
    sourceConfig: WISLAudioProcessorConfig,
    targetConfig: WISLAudioProcessorConfig,
  ) {
    return this.handleConnection(
      sourceNodeID,
      targetNodeID,
      sourceName,
      targetName,
      sourceConfig,
      targetConfig,
      "add",
    );
  }

  public addProcessor(id: string, config: WISLAudioProcessorConfig) {
    if (id in this.processors) {
      console.warn(`Processor for id '${id}' already exists`);
      return this.processors[id];
    }

    try {
      const processor = ProcessorWorkletNode.fromConfig(this.context, config);
      this.processors[id] = processor;
      return processor;
    } catch (e) {
      console.error(`Failed to add processor for '${id}': ${e}`);
    }
  }

  public deleteConnection(
    sourceNodeID: string,
    targetNodeID: string,
    sourceName: string,
    targetName: string,
    sourceConfig: WISLAudioProcessorConfig,
    targetConfig: WISLAudioProcessorConfig,
  ) {
    return this.handleConnection(
      sourceNodeID,
      targetNodeID,
      sourceName,
      targetName,
      sourceConfig,
      targetConfig,
      "delete",
    );
  }

  public deleteProcessor(id: string) {
    if (id in this.processors) {
      this.processors[id].disconnect();
      delete this.processors[id];
    }
  }

  /**
   * Register the audio processor module
   * @param url The path to the module registered via registerWISLProcessor
   *
   * Each processor module should only be registered once
   */
  public async registerNodeProcessor(url: string) {
    try {
      await this.context.audioWorklet.addModule(url);
    } catch (e) {
      console.error(`Failed to register processor '${url}': ${e}`);
    }
  }

  public resumeContext() {
    if (this.context.state !== "running") {
      this.context.resume();
    }
  }

  private handleConnection(
    sourceNodeID: string,
    targetNodeID: string,
    sourceName: string,
    targetName: string,
    sourceConfig: WISLAudioProcessorConfig,
    targetConfig: WISLAudioProcessorConfig,
    operation: "add" | "delete",
  ) {
    if (!(sourceNodeID in this.processors) || !(targetNodeID in this.processors)) {
      console.error(`Failed to ${operation} connection: source () and target ()`);
      return false;
    }

    const sourceIndex = sourceConfig.outputs[sourceName]?.index;
    const targetIndex = targetConfig.inputs[targetName]?.index;

    if (sourceIndex == null || targetIndex == null) {
      console.error(
        `Failed to ${operation} connection: could not convert source and target names (${sourceName}, ${targetName}) to indexes (${sourceIndex}, ${targetIndex})`,
      );
      return false;
    }

    try {
      if (operation === "add") {
        this.processors[sourceNodeID].connect(
          this.processors[targetNodeID],
          sourceIndex,
          targetIndex,
        );
      } else {
        this.processors[sourceNodeID].disconnect(
          this.processors[targetNodeID],
          sourceIndex,
          targetIndex,
        );
      }
    } catch (e) {
      console.error(`Failed to ${operation} connection: connect call failed ${e}`);
      return false;
    }

    return true;
  }
}

export const audioManager = new AudioManager();
