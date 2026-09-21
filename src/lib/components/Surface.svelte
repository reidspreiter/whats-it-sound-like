<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {}

  let { children, class: className, ...others }: SurfaceProps = $props();
</script>

<div class="surface {className}" {...others}>
  {@render children?.()}
</div>

<style>
  .surface {
    background: var(--color-bg-surface);
    border: 1px solid var(--color-surface-border);
    border-radius: 4px;
    padding: 4px;
  }
</style>
