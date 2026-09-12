<script lang="ts">
  import { SvelteFlowProvider } from "@xyflow/svelte";

  import { MainFlow, SelectionMonitor } from "./lib/flow";
  import { KeybindHintProvider, KeybindKeyListener } from "./lib/state";
</script>

<div style="width: 100%; height: 100%;">
  <SvelteFlowProvider>
    <MainFlow />
    <SelectionMonitor />
  </SvelteFlowProvider>
  <KeybindKeyListener />
  <KeybindHintProvider />
</div>
