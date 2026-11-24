import type { WISLAudioProcessorConfig } from "../../audio/shared";

export interface WISLNodeConfig<
  TName extends string = string,
  TProcessorConfig extends undefined | WISLAudioProcessorConfig = undefined,
> {
  name: TName;
  processor: TProcessorConfig;
}

interface _WISLNodeConfig {
  name: string;
  processor?: WISLAudioProcessorConfig;
}

class NodeConfigBuilder<
  TName extends string = string,
  TProcessorConfig extends WISLAudioProcessorConfig = never,
> {
  private data: _WISLNodeConfig = { name: "" };

  constructor(name?: TName, existingData?: _WISLNodeConfig) {
    if (existingData) {
      this.data = existingData;
    } else if (name) {
      this.data.name = name;
    }
  }

  build(): WISLNodeConfig<TName, TProcessorConfig> {
    return this.data as WISLNodeConfig<TName, TProcessorConfig>;
  }

  /**
   * Add the node's corresponding audio processor config, if it has one
   * @param config The audio processor config
   */
  withProcessor<const TProcessorConfig extends WISLAudioProcessorConfig>(config: TProcessorConfig) {
    return new NodeConfigBuilder<TName, TProcessorConfig>(undefined, {
      ...this.data,
      processor: config,
    });
  }
}

/**
 *
 * @param name The node name. This should never change. If changed, all existing projects using the
 * old name will fail to initialize the node on reload.
 */
export const createNodeConfig = <const TName extends string>(name: TName) => {
  return new NodeConfigBuilder<TName>(name);
};
