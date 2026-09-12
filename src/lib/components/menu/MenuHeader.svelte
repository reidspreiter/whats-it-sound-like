<script lang="ts">
  import type { Snippet } from "svelte";

  import MenuItem from "./MenuItem.svelte";

  interface MenuHeaderProps {
    children?: Snippet;
  }

  let { children }: MenuHeaderProps = $props();
</script>

<MenuItem type="text" {children} />
