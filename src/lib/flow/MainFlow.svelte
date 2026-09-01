<script lang="ts">
  import {
    Background,
    type Edge,
    type Node,
    type NodeTypes,
    Panel,
    SvelteFlow,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/base.css";

  import { nodeRegistry, type NodeRenderContext, setNodeRenderContext } from "../nodes";
  import MenuBar from "./MenuBar.svelte";
  import NodePlacementContext from "./NodePlacementContext.svelte";

  let context = $state<NodeRenderContext>({ visualOnly: false });
  setNodeRenderContext(context);

  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);

  const nodeTypes: NodeTypes = Object.entries(nodeRegistry).reduce((prev, [name, node]) => {
    prev[name] = node.node;
    return prev;
  }, {} as NodeTypes);
  let nodePlacementContextRef: ReturnType<typeof NodePlacementContext> | undefined;
</script>

<SvelteFlow
  bind:nodes
  bind:edges
  {nodeTypes}
  fitView
  proOptions={{ hideAttribution: true }}
  maxZoom={5}
  onpanecontextmenu={(e) => nodePlacementContextRef?.handleContext(e.event)}
>
  <Background bgColor="var(--color-bg-main)" />
  <Panel position="top-left" style="margin: 0;">
    <MenuBar />
  </Panel>
</SvelteFlow>
<NodePlacementContext bind:this={nodePlacementContextRef} />
