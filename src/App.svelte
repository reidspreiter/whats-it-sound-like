<script lang="ts">
  import { SvelteFlowProvider } from "@xyflow/svelte";

  import { MainFlow } from "./lib/flow";
</script>

<div style="width: 100%; height: 100%;">
  <SvelteFlowProvider>
    <MainFlow />
  </SvelteFlowProvider>
</div>
