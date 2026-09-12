<script module lang="ts">
  export const JACK_DIAMETER_PX = 12;
</script>

<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";

  import { getNodeRenderContext } from "../nodeRenderContext";

  type JackType = "input" | "output";
  type HandleType = "source" | "target";

  interface JackProps {
    name: string;
    type: JackType;
  }

  let { name, type }: JackProps = $props();

  let context = getNodeRenderContext();

  const handleType = $derived<HandleType>(type === "input" ? "target" : "source");
  const style = $derived(
    `position: absolute; background: var(--color-analog-well); height: ${JACK_DIAMETER_PX}px; width: ${JACK_DIAMETER_PX}px; border-radius: 50%; top: 50%; transform: translate(-50%, -50%);`,
  );
</script>

<div class="jack-wrapper">
  <div class="jack">
    {#if !context.visualOnly}
      <Handle {style} id={name} type={handleType} position={Position.Top} />
    {:else}
      <div {style}></div>
    {/if}
  </div>
  <p>{name}</p>
</div>

<style>
  p {
    margin: 0;
    margin-top: 2px;
  }

  .jack-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2px;
  }

  .jack {
    position: relative;
    padding: 10px;
    border: 1px solid var(--color-surface-border);
    border-radius: 50%;
  }
</style>
