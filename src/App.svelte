<script lang="ts">
  import { SvelteFlowProvider } from "@xyflow/svelte";
  import { onMount } from "svelte";
  import { SvelteSet } from "svelte/reactivity";

  import type { WISLAudioProcessorConfig } from "./lib/audio/shared";

  import { audioManager } from "./lib/audio";
  import { MainFlow, SelectionMonitor } from "./lib/flow";
  import { nodeRegistry } from "./lib/nodes";
  import { KeybindHintProvider, KeybindKeyListener, NotificationProvider } from "./lib/state";

  let initialized = $state(false);

  // Register all processors here to avoid async headaches when adding nodes to the flow later on.
  onMount(async () => {
    const registeredProcessors = new SvelteSet<string>();
    const promises = [];

    for (const node of Object.values(nodeRegistry)) {
      const processorConfig = node.config.processor as undefined | WISLAudioProcessorConfig;
      if (processorConfig !== undefined && !registeredProcessors.has(processorConfig.name)) {
        registeredProcessors.add(processorConfig.name);
        promises.push(audioManager.registerNodeProcessor(processorConfig.url));
      }
    }

    await Promise.all(promises);
    initialized = true;
  });
</script>

{#if initialized}
  <div style="width: 100%; height: 100%;">
    <SvelteFlowProvider>
      <MainFlow />
      <SelectionMonitor />
    </SvelteFlowProvider>
    <KeybindKeyListener />
    <KeybindHintProvider />
    <NotificationProvider />
  </div>
{:else}
  <p>Initializing...</p>
{/if}
