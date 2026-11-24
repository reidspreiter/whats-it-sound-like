import { type Edge, type Node } from "@xyflow/svelte";

import { audioManager } from "../audio";
import { nodeRegistry, type WISLNode } from "../nodes";
import { CABLE_NAME } from "./util";

export type WISLEdge = Edge;

export type GetNodes = (ids?: string[]) => Node[];

const handleEdge = (edge: WISLEdge, getNodes: GetNodes, operation: "add" | "delete") => {
  if (edge.sourceHandle == null || edge.targetHandle == null) {
    console.error(
      `Failed to ${operation} edge: source (${edge.sourceHandle}) or target (${edge.targetHandle}) is unnamed`,
    );
    return false;
  }

  const nodes = getNodes([edge.source, edge.target]) as WISLNode[];

  if (nodes.length < 2) {
    console.error(
      `Failed to ${operation} edge: could not find nodes with IDs '${edge.source}' and '${edge.target}' (${nodes})`,
    );
    return false;
  }

  const sourceConfig = nodeRegistry[nodes[0].type]?.config;
  const targetConfig = nodeRegistry[nodes[1].type]?.config;

  if (sourceConfig == null) {
    console.error(
      `Failed to ${operation} edge: failed to find config for node type '${nodes[0].type}'`,
    );
    return false;
  } else if (targetConfig == null) {
    console.error(
      `Failed to ${operation} edge: failed to find config for node type '${nodes[1].type}'`,
    );
    return false;
  }

  // If one of the pairs does not have a corresponding processor,
  // no need to connect audio
  if (sourceConfig.processor == null || targetConfig.processor == null) {
    return true;
  }

  const func = operation === "add" ? audioManager.addConnection : audioManager.deleteConnection;

  return func.call(
    audioManager,
    edge.source,
    edge.target,
    edge.sourceHandle,
    edge.targetHandle,
    sourceConfig.processor,
    targetConfig.processor,
  );
};

/**
 * Initializes processor connection. Edges should not be placed on the flow without passing through this function.
 *
 * @param edge A valid edge
 * @param getNodes Svelte flow function to retrieve nodes from IDs
 * @returns ['edge', boolean: true if edge was initialized successfully]
 */
export const initializeEdge = (edge: WISLEdge, getNodes: GetNodes): [WISLEdge, boolean] => {
  edge.type ??= CABLE_NAME;
  edge.zIndex ??= 999;

  const success = handleEdge(edge, getNodes, "add");

  return [edge, success];
};

export const deleteEdge = (edge: WISLEdge, getNodes: GetNodes) => {
  return handleEdge(edge, getNodes, "delete");
};
