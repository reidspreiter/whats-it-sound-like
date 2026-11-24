<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface NodeSurfaceProps extends HTMLAttributes<HTMLDivElement> {}

  let { children, ...others }: NodeSurfaceProps = $props();
</script>

<div style="display: flex; flex-direction: column;">
  <div class="node-surface" {...others}>
    {@render children?.()}
  </div>
  <span class="node-surface-front"></span>
</div>

<style>
  .node-surface {
    background: var(--color-bg-surface);
    border: 1px solid var(--color-surface-border);
    padding: 4px;
  }

  .node-surface-front {
    width: 100%;
    height: 7px;
    background: var(--color-bg-surface-side);
    position: absolute;
    left: 0px;
    top: 100%;
  }
</style>
