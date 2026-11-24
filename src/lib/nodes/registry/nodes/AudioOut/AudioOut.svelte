<script lang="ts" module>
  import { createNodeConfig, type GetNodeType } from "../../../node";
  import processorConfig from "./audioOut.config";

  export const CONFIG = createNodeConfig("Audio Out").withProcessor(processorConfig).build();

  export type AudioOutNode = GetNodeType<typeof CONFIG>;
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import { audioManager } from "../../../../audio";
  import { getNodeRenderContext, Jack, Knob, NodeSurface, useWISLNode } from "../../../node";

  const context = getNodeRenderContext();

  let { data, id }: AudioOutNode = $props();
  let { getJackProps, getKnobProps } = $derived(useWISLNode<AudioOutNode>(id));

  onMount(() => {
    if (!context.visualOnly) {
      data.processor?.connect(audioManager.destination);
    }
  });
</script>

<NodeSurface>
  <Knob {...getKnobProps("level")} label="Level" />
  <div style="display: flex;">
    <Jack {...getJackProps("leftMono")} label="L/Mon" />
    <Jack {...getJackProps("right")} label="Right" />
  </div></NodeSurface
>
