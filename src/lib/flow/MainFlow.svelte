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
    useSvelteFlow,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/base.css";
  import { onDestroy, untrack } from "svelte";

  import { Cable, CABLE_NAME, CableConnection } from "../edges";
  import { nodeRegistry, type NodeRenderContext, setNodeRenderContext } from "../nodes";
  import {
    activeProject,
    loadProjectFlow,
    previousActiveProjectId,
    saveProjectFlow,
  } from "../state";
  import { useThrottleCallback } from "../util";
  import { MenuBar } from "./menu";
  import NodePlacementContext from "./NodePlacementContext.svelte";
  import StatusBar from "./StatusBar.svelte";

  let context = $state<NodeRenderContext>({ visualOnly: false });
  setNodeRenderContext(context);

  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);

  const { fitView } = useSvelteFlow();
  const { cancel: cancelThrottle, throttled: saveProjectFlowThrottled } = useThrottleCallback(
    () => {
      if (activeProject.id !== null) {
        saveProjectFlow(activeProject.id, nodes, edges);
      }
    },
    5000,
  );

  $effect(() => {
    const id = activeProject.id;

    if (id !== null) {
      untrack(() => {
        if (previousActiveProjectId !== null) {
          saveProjectFlow(previousActiveProjectId, nodes, edges);
        }

        loadProjectFlow(id).then(([newNodes, newCables]) => {
          nodes = newNodes;
          edges = newCables;
          fitView();
        });
      });
    }
  });

  $effect(() => {
    const _ = nodes;
    const __ = edges;

    untrack(saveProjectFlowThrottled);
  });

  onDestroy(() => {
    cancelThrottle();
  });

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
  <Panel position="bottom-left" style="margin: 0;">
    <StatusBar />
  </Panel>
</SvelteFlow>
<NodePlacementContext bind:this={nodePlacementContextRef} />
