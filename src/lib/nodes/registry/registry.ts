import type { Component } from "svelte";

import type { WISLNodeConfig } from "../node/config";

/**
 * What each node component svelte module is required to export
 */
export interface NodeComponent {
  CONFIG: WISLNodeConfig;
  default: Component;
}

/**
 * Node data available in the registry once the component has been successfully registered
 */
export interface RegisteredNode {
  config: WISLNodeConfig;
  node: Component;
}

export type NodeRegistry = Record<string, RegisteredNode>;

const getNodeComponents = () => {
  return import.meta.glob<NodeComponent>("./nodes/**/*.svelte", { eager: true });
};

const getNodeRegistry = () => {
  const registry = {} as NodeRegistry;

  for (const [path, component] of Object.entries(getNodeComponents())) {
    try {
      registry[component.CONFIG.name] = {
        config: component.CONFIG,
        node: component.default,
      };
    } catch (e) {
      console.error(`Failed to register node component "${path}": ${e}`);
    }
  }
  return registry;
};

export const nodeRegistry = Object.freeze(getNodeRegistry());
