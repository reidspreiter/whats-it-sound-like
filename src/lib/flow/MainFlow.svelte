<script lang="ts">
  import {
    Background,
    type Edge,
    type EdgeTypes,
    type Node,
    type NodeTypes,
    type OnBeforeConnect,
    Panel,
    SvelteFlow,
    useConnection,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/base.css";

  import { Cable, CABLE_NAME, CableConnection } from "../edges";
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

  const edgeTypes: EdgeTypes = {
    [CABLE_NAME]: Cable,
  };

  let nodePlacementContextRef: ReturnType<typeof NodePlacementContext> | undefined;

  const onBeforeConnect: OnBeforeConnect = (c) => {
    const newEdge = {
      data: {},
      id: `${Math.random()}`,
      source: c.source,
      sourceHandle: c.sourceHandle,
      target: c.target,
      targetHandle: c.targetHandle,
      type: CABLE_NAME,
      zIndex: 999,
    } satisfies Edge;

    edges = [...edges, newEdge];
  };

  const connection = useConnection();
</script>

<SvelteFlow
  class={connection.current.inProgress ? "connection-in-progress" : ""}
  bind:nodes
  bind:edges
  {nodeTypes}
  {edgeTypes}
  onbeforeconnect={onBeforeConnect}
  fitView
  connectionLineComponent={CableConnection}
  proOptions={{ hideAttribution: true }}
  maxZoom={5}
  zIndexMode="manual"
  onpanecontextmenu={(e) => nodePlacementContextRef?.handleContext(e.event)}
>
  <Background bgColor="var(--color-bg-main)" />
  <Panel position="top-left" style="margin: 0;">
    <MenuBar />
  </Panel>
</SvelteFlow>
<NodePlacementContext bind:this={nodePlacementContextRef} />
