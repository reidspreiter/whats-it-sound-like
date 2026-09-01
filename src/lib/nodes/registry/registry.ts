import type { Component } from "svelte";

/**
 * What each node component svelte module is required to export
 */
export interface NodeComponent {
  default: Component;
}

/**
 * Node data available in the registry once the component has been successfully registered
 */
export interface RegisteredNode {
  node: Component;
}

export type NodeRegistry = Record<string, RegisteredNode>;

const getNodeComponents = () => {
  return import.meta.glob<NodeComponent>("./nodes/**/*.svelte", { eager: true });
};

const getNodeRegistry = () => {
  const registry = {} as NodeRegistry;

  // Temporary name until we determine node definition structure
  let index = 0;
  for (const [path, component] of Object.entries(getNodeComponents())) {
    try {
      registry[index.toString()] = {
        node: component.default,
      };
    } catch (e) {
      console.error(`Failed to register node component "${path}": ${e}`);
    }
    index++;
  }
  return registry;
};

export const nodeRegistry = Object.freeze(getNodeRegistry());
