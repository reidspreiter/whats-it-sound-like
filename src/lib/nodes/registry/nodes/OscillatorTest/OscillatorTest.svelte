<script lang="ts" module>
  import { createNodeConfig, type GetNodeType } from "../../../node";
  import processorConfig from "./oscillatorTest.config";

  export const CONFIG = createNodeConfig("Oscillator Test").withProcessor(processorConfig).build();

  export type AudioOutNode = GetNodeType<typeof CONFIG>;
</script>

<script lang="ts">
  import { Jack, NodeSurface, useWISLNode } from "../../../node";

  let { id }: AudioOutNode = $props();
  let { getJackProps } = $derived(useWISLNode<AudioOutNode>(id));
</script>

<NodeSurface
  ><div>
    <Jack {...getJackProps("out")} />
  </div></NodeSurface
>
