<script lang="ts" module>
  import { createNodeConfig, type GetNodeType } from "../../../node";
  import processorConfig from "./audioOut.config";

  export const CONFIG = createNodeConfig("Audio Out").withProcessor(processorConfig).build();

  export type AudioOutNode = GetNodeType<typeof CONFIG>;
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import { audioManager } from "../../../../audio";
  import { clamp } from "../../../../util";
  import { getNodeRenderContext, Jack, Knob, NodeSurface, useWISLNode } from "../../../node";

  const context = getNodeRenderContext();

  let { data, id }: AudioOutNode = $props();
  let lChannelMeter = $state<HTMLDivElement>();
  let rChannelMeter = $state<HTMLDivElement>();
  let { getJackProps, getKnobProps, useAnimation } = useWISLNode<AudioOutNode>(() => id);

  // Derive processor so updating parms doesn't trigger processor state updates
  const processor = $derived(data.processor);

  const ch1 = $derived(processor.getOutputAnalyzer("out", { channel: 1, fftSize: 256 }));
  const ch2 = $derived(processor.getOutputAnalyzer("out", { channel: 2, fftSize: 256 }));

  onMount(() => {
    if (!context.visualOnly) {
      processor.connect(audioManager.destination);
    }
  });

  $effect(() => {
    if (!context.visualOnly && ch1 && ch2) {
      useAnimation(() => {
        if (lChannelMeter !== undefined && rChannelMeter !== undefined) {
          const lScale = clamp(ch1.getRMS(), 0, 1);
          const rScale = clamp(ch2.getRMS(), 0, 1);

          lChannelMeter.style.transform = `scaleY(${lScale})`;
          rChannelMeter.style.transform = `scaleY(${rScale})`;
        }
      });
    }
  });
</script>

<NodeSurface>
  <div class="meter-well">
    <div bind:this={lChannelMeter} class="meter"></div>
    <div bind:this={rChannelMeter} class="meter"></div>
  </div>
  <Knob {...getKnobProps("level")} label="Level" />
  <div style="display: flex;">
    <Jack {...getJackProps("leftMono")} label="L/Mon" />
    <Jack {...getJackProps("right")} label="Right" />
  </div></NodeSurface
>

<style>
  .meter-well {
    background: var(--color-analog-well);
    display: flex;
    gap: 2px;
    justify-content: center;
    padding: 5px;
    width: 40%;
    border-radius: 4px;
    margin-bottom: 8px;
    margin-top: 4px;
  }
  .meter {
    height: 100px;
    width: 4px;
    background-color: var(--color-highlight-blue);
    transform-origin: bottom;
    transform: scaleY(0);
    will-change: transform;
  }
</style>
