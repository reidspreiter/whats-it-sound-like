import type { Node, NodeOrigin, XYPosition } from "@xyflow/svelte";

import type { WISLNodeConfig } from "./config";

import { audioManager, type ProcessorWorkletNode } from "../../audio";
import { type WISLAudioProcessorConfig } from "../../audio/shared";
import { nodeRegistry } from "../registry";

export type GetNodeType<
  TConfig extends WISLNodeConfig<string, undefined | WISLAudioProcessorConfig>,
> = WISLNode<TConfig["name"], TConfig["processor"]>;

export type WISLNode<
  TName extends string = string,
  TProcessorConfig extends undefined | WISLAudioProcessorConfig =
    undefined | WISLAudioProcessorConfig,
> = Node<
  WISLNodeData<
    TProcessorConfig extends WISLAudioProcessorConfig
      ? Record<keyof TProcessorConfig["params"], number>
      : undefined,
    TProcessorConfig
  >,
  TName
>;

export interface JsonifiedNode {
  data: Record<string, unknown>;
  id: string;
  measured?: {
    height?: number;
    width?: number;
  };
  origin?: NodeOrigin;
  position: XYPosition;
  type: string;
  zIndex?: number;
}

export type WISLNodeData<
  TParams extends Record<string, unknown> | undefined = undefined,
  TProcessorConfig extends undefined | WISLAudioProcessorConfig = undefined,
> = (TParams extends Record<string, unknown> ? TParams : {}) &
  (TProcessorConfig extends WISLAudioProcessorConfig
    ? { processor: ProcessorWorkletNode<TProcessorConfig> }
    : { processor?: undefined }) & { [key: string]: unknown };

/**
 * Initializes node data and processor. Nodes should not be placed on the flow without passing through this function.
 *
 * @param node A valid node
 * @returns ['node' with updated data, boolean: true if node was initialized successfully]
 */
export const initializeNode = (node: WISLNode): [WISLNode, boolean] => {
  if (!(node.type in nodeRegistry)) {
    console.error(`Failed to initialize node: type '${node.type}' is not registered`);
    return [node, false];
  }

  const config = nodeRegistry[node.type].config;

  if (config.processor !== undefined) {
    // Initialize param reflections to their defaults if they aren't defined yet
    for (const [name, info] of Object.entries(
      (config.processor as WISLAudioProcessorConfig).params,
    )) {
      if (!Object.hasOwn(node.data, name)) {
        node.data[name] = info.defaultValue;
      }
    }

    node.data.processor = audioManager.addProcessor(node.id, config.processor);

    if (node.data.processor === undefined) {
      return [node, false];
    }
  }

  return [node, true];
};

export const deleteNode = (node: WISLNode) => {
  audioManager.deleteProcessor(node.id);
};

export const jsonifyNode = (node: WISLNode) => {
  const jsonData = {} as Record<string, unknown>;

  if (node.type in nodeRegistry) {
    const config = nodeRegistry[node.type].config;

    if (config.processor !== undefined) {
      for (const name of Object.keys((config.processor as WISLAudioProcessorConfig).params)) {
        jsonData[name] = node.data[name];
      }
    }
  } else {
    console.error(`Failed to jsonify node: type '${node.type}' is not registered`);
  }

  return {
    data: jsonData,
    id: node.id,
    measured: node.measured,
    origin: node.origin,
    position: node.position,
    type: node.type,
    zIndex: node.zIndex,
  } satisfies JsonifiedNode;
};
