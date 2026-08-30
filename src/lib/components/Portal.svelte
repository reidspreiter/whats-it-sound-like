<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { onDestroy, onMount } from "svelte";

  interface PortalProps extends HTMLAttributes<HTMLDivElement> {}

  let { children, ...others }: PortalProps = $props();

  let ref = $state<HTMLDivElement>();
  let portal = $state<HTMLDivElement>();

  onMount(() => {
    portal = document.createElement("div");
    document.body.appendChild(portal);

    if (ref !== undefined) {
      portal.appendChild(ref);
    }
  });

  onDestroy(() => {
    if (portal !== undefined) {
      document.body.removeChild(portal);
    }
  });
</script>

<div bind:this={ref} {...others}>
  {@render children?.()}
</div>
