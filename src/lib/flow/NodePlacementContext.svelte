<script lang="ts">
  import { useNodes, useSvelteFlow } from "@xyflow/svelte";

  import { Context } from "../components";
  import Surface from "../components/Surface.svelte";
  import {
    initializeNode,
    nodeRegistry,
    type NodeRenderContext,
    setNodeRenderContext,
  } from "../nodes";
  import { postError } from "../state";

  let context = $state<NodeRenderContext>({ visualOnly: true });
  setNodeRenderContext(context);
  const nodes = useNodes();
  const { screenToFlowPosition } = useSvelteFlow();

  let contextRef: ReturnType<typeof Context> | undefined;

  export const handleContext = (e: MouseEvent) => {
    contextRef?.handleContext(e);
  };

  const placeNode = (type: string) => {
    const contextPos = contextRef?.getPos() ?? { left: 0, top: 0 };
    const position = screenToFlowPosition({ x: contextPos.left, y: contextPos.top });

    const [newNode, success] = initializeNode({
      data: {},
      id: `${Math.random()}`,
      origin: [0, 0],
      position,
      type,
    });

    if (success) {
      nodes.current = [...nodes.current, newNode];
    } else {
      postError(`Failed to place node of type '${type}'`);
    }

    contextRef?.close();
  };
</script>

<Context bind:this={contextRef} anchor={null}>
  <Surface>
    Nodes
    <div class="nodes-list-container">
      <div class="nodes-list">
        {#each Object.entries(nodeRegistry) as [name, node] (name)}
          <button class="node-wrapper" onclick={() => placeNode(name)}>
            <div class="node">
              <node.node type={name} />
            </div>
          </button>
        {:else}
          <p>No nodes found</p>
        {/each}
      </div>
    </div>
  </Surface>
</Context>

<style>
  .nodes-list-container {
    max-height: 60vh;
    max-width: 40vw;
    overflow-y: auto;
    padding: 10px;
  }

  .nodes-list {
    display: flex;
    flex-wrap: wrap;
    overflow: visible;
  }

  .node-wrapper {
    all: unset;
    cursor: pointer;

    /* So ::after elements don't get positioned incorrectly */
    position: relative;
  }

  .node {
    pointer-events: none;
  }
</style>
