<script lang="ts">
  import { Background, type Edge, type Node, Panel, SvelteFlow } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/base.css";

  import MenuBar from "./MenuBar.svelte";

  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);
</script>

<SvelteFlow bind:nodes bind:edges fitView proOptions={{ hideAttribution: true }} maxZoom={5}>
  <Background bgColor="var(--color-bg-main)" />
  <Panel position="top-left" style="margin: 0;">
    <MenuBar />
  </Panel>
</SvelteFlow>
