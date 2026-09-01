import { createContext } from "svelte";

export interface NodeRenderContext {
  visualOnly: boolean; // Node components will not be usable but their skins will still be rendered
}

export const [getNodeRenderContext, setNodeRenderContext] = createContext<NodeRenderContext>();
