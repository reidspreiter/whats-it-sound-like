<script lang="ts">
  import {
    Background,
    type EdgeTypes,
    type NodeTypes,
    type OnBeforeConnect,
    type OnDelete,
    type OnReconnect,
    Panel,
    SvelteFlow,
    useConnection,
    useSvelteFlow,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/base.css";
  import { onDestroy, tick, untrack } from "svelte";

  import { audioManager } from "../audio";
  import {
    Cable,
    CABLE_NAME,
    CableConnection,
    deleteEdge,
    initializeEdge,
    type WISLEdge,
  } from "../edges";
  import {
    deleteNode,
    initializeNode,
    nodeRegistry,
    type NodeRenderContext,
    setNodeRenderContext,
    type WISLNode,
  } from "../nodes";
  import {
    activeProject,
    loadProjectFlow,
    postError,
    preferences,
    previousActiveProjectId,
    saveProjectFlow,
  } from "../state";
  import { useThrottleCallback } from "../util";
  import { MenuBar } from "./menu";
  import NodePlacementContext from "./NodePlacementContext.svelte";
  import StatusBar from "./StatusBar.svelte";

  let context = $state<NodeRenderContext>({ visualOnly: false });
  setNodeRenderContext(context);

  let nodes = $state.raw<WISLNode[]>([]);
  let edges = $state.raw<WISLEdge[]>([]);

  const { deleteElements, fitView, getNodes } = useSvelteFlow();
  const { cancel: cancelThrottle, throttled: saveProjectFlowThrottled } = useThrottleCallback(
    () => {
      if (activeProject.id !== null) {
        saveProjectFlow(activeProject.id, nodes, edges);
      }
    },
    5000,
  );

  // Effect for changing projects
  $effect(() => {
    const id = activeProject.id;

    if (id !== null) {
      untrack(() => {
        deleteElements({
          edges: edges.map((edge) => ({ id: edge.id })),
          nodes: nodes.map((node) => ({ id: node.id })),
        });

        if (previousActiveProjectId !== null) {
          saveProjectFlow(previousActiveProjectId, nodes, edges);
        }

        loadProjectFlow(id).then(([newNodes, newEdges]) => {
          for (const node of newNodes) {
            const [_, success] = initializeNode(node);

            if (!success) {
              postError(`Failed to initialize node '${node.type}' with ID '${node.id}'`);
            }
          }

          nodes = newNodes;

          tick().then(() => {
            for (const edge of newEdges) {
              const [_, success] = initializeEdge(edge, getNodes);

              if (!success) {
                postError(
                  `Failed to initialize edge from '${edge.source}.${edge.sourceHandle}' to '${edge.target}.${edge.targetHandle}'`,
                );
              }
            }

            edges = newEdges;
            fitView();
          });
        });
      });
    }
  });

  $effect(() => {
    const _ = nodes;
    const __ = edges;

    untrack(saveProjectFlowThrottled);
  });

  const handleDelete: OnDelete<WISLNode> = (params: { edges: WISLEdge[]; nodes: WISLNode[] }) => {
    if (params.edges.length > 0) {
      for (const edge of params.edges) {
        const success = deleteEdge(edge, getNodes);

        if (!success) {
          postError(
            `Failed to delete edge from '${edge.source}.${edge.sourceHandle}' to '${edge.target}.${edge.targetHandle}'`,
          );
        }
      }
    }

    if (params.nodes.length > 0) {
      for (const node of params.nodes) {
        deleteNode(node);
      }
    }
  };

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
    const [newEdge, success] = initializeEdge(
      {
        data: {},
        id: `${Math.random()}`,
        source: c.source,
        sourceHandle: c.sourceHandle,
        target: c.target,
        targetHandle: c.targetHandle,
      },
      getNodes,
    );

    if (success) {
      edges = [...edges, newEdge];
    } else {
      postError(
        `Failed to add edge from '${c.source}.${c.sourceHandle}' to '${c.target}.${c.targetHandle}'`,
      );
    }
  };

  const onReconnect: OnReconnect<WISLEdge> = (oldEdge, newConnection) => {
    const deleteSuccess = deleteEdge(oldEdge, getNodes);

    if (!deleteSuccess) {
      postError(
        `Failed to reconnect edge: ${oldEdge.sourceHandle}->${oldEdge.targetHandle} to ${newConnection.sourceHandle}->${newConnection.targetHandle}`,
      );
      return;
    }

    Object.assign(oldEdge, newConnection);
    const [_, initSuccess] = initializeEdge(oldEdge, getNodes);

    if (!initSuccess) {
      postError(
        `Failed to reconnect edge: ${oldEdge.sourceHandle}->${oldEdge.targetHandle} to ${newConnection.sourceHandle}->${newConnection.targetHandle}`,
      );
    }
  };

  const connection = useConnection();
</script>

<SvelteFlow
  class={connection.current.inProgress ? "connection-in-progress" : ""}
  bind:nodes
  bind:edges
  {nodeTypes}
  {edgeTypes}
  ondelete={handleDelete}
  onbeforeconnect={onBeforeConnect}
  onreconnect={onReconnect}
  fitView
  connectionLineComponent={CableConnection}
  proOptions={{ hideAttribution: true }}
  maxZoom={5}
  onpaneclick={() => audioManager.resumeContext()}
  zIndexMode="manual"
  onpanecontextmenu={(e) => nodePlacementContextRef?.handleContext(e.event)}
  panOnDrag={preferences.navigationStyle === "pan-on-drag"}
  panOnScroll={preferences.navigationStyle === "pan-on-scroll"}
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
