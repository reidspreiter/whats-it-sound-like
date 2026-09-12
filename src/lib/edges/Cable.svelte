<script lang="ts">
  import { type EdgeProps, EdgeReconnectAnchor, useSvelteFlow } from "@xyflow/svelte";

  import { getSelectedEdgeIds } from "../flow/selection/SelectionMonitor.svelte";
  import { addKeybindHint, keybindFlags, keybinds, preferences, removeKeybindHint } from "../state";
  import CableMarker, { CABLE_MARKER_RADIUS } from "./CableMarker.svelte";
  import { CABLE_MARKER_Y_OFFSET, getQuadraticCurvePath } from "./util";

  let { id, selected, source, sourceX, sourceY, target, targetX, targetY }: EdgeProps = $props();

  const { deleteElements, updateEdge, updateNode } = useSvelteFlow();

  let hovered = $state(false);
  let reconnecting = $state(false);

  const cablePath = $derived(
    getQuadraticCurvePath(sourceX, sourceY, targetX, targetY, preferences.cableTension),
  );

  const deleteCable = () => {
    deleteElements({ edges: [{ id }] });
  };

  const handleClick = (e: MouseEvent) => {
    if (e.shiftKey) {
      deleteCable();
    } else {
      // Ensure all other edges are deselected.
      // When selection click is performed on a
      // reconnect anchor, the other edges stay selected.
      // Svelte flow documentation doesn't spawn the reconnect anchor
      // until the corresponding edge is selected, but I don't
      if (!e.ctrlKey) {
        const selectedEdgeIds = getSelectedEdgeIds();
        for (const edgeId of selectedEdgeIds) {
          updateEdge(edgeId, { selected: false });
        }
      }
      updateNode(source, { selected: false });
      updateNode(target, { selected: false });
      updateEdge(id, { selected: true });
    }
  };

  const onMouseEnterAnchor = () => {
    hovered = true;
    addKeybindHint("add-edge-on-top", {
      description: "New cable",
      keybind: [...keybinds.addEdgeOnTop, "Drag"],
    });
    addKeybindHint("delete-top-cable", {
      description: "Delete top cable",
      keybind: [...keybinds.deleteTopCable, "Left-Click"],
    });
  };

  const onMouseLeaveAnchor = () => {
    hovered = false;
    removeKeybindHint("add-edge-on-top");
    removeKeybindHint("delete-top-cable");
  };
</script>

<!-- 
  We don't need to display the original cable if we are dragging a reconnect anchor.
  Svelte flow will display a CableConnection component instead
-->
{#if !reconnecting}
  <g
    role="presentation"
    onmouseenter={() => (hovered = true)}
    onmouseleave={() => (hovered = false)}
  >
    <path
      stroke="var(--color-highlight-blue)"
      stroke-opacity={hovered || selected ? 1 : preferences.cableOpacity}
      onclick={keybindFlags.selectCableEdge ? handleClick : undefined}
      role={keybindFlags.selectCableEdge ? "button" : undefined}
      stroke-width="4"
      fill="none"
      pointer-events={keybindFlags.selectCableEdge ? undefined : "none"}
      d={cablePath}
    />
    <!--
     Don't need click events for selection or deletion here.
     Svelte flow handles selection automatically.
    -->
    <CableMarker centerX={sourceX} centerY={sourceY} strokeColor="var(--color-highlight-blue)" />
    <CableMarker centerX={targetX} centerY={targetY} strokeColor="var(--color-highlight-blue)" />
  </g>
{/if}

{#if !keybindFlags.addEdgeOnTop && hovered}
  <EdgeReconnectAnchor
    size={CABLE_MARKER_RADIUS * 3}
    onmouseenter={onMouseEnterAnchor}
    onmouseleave={onMouseLeaveAnchor}
    onclick={handleClick}
    style="border-radius: 50%;"
    type="source"
    position={{ x: sourceX, y: sourceY + CABLE_MARKER_Y_OFFSET }}
    bind:reconnecting
  />
  <EdgeReconnectAnchor
    onmouseenter={onMouseEnterAnchor}
    onmouseleave={onMouseLeaveAnchor}
    onclick={handleClick}
    size={CABLE_MARKER_RADIUS * 3}
    style="border-radius: 50%;"
    type="target"
    position={{ x: targetX, y: targetY + CABLE_MARKER_Y_OFFSET }}
    bind:reconnecting
  />
{/if}
