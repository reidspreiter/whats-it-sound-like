<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import Surface from "../Surface.svelte";
  import { type MenuContext, setMenuContext } from "./menuContext.svelte";

  interface MenuProps extends HTMLAttributes<HTMLDivElement> {}

  let { children, ...others }: MenuProps = $props();

  let context = $state<MenuContext>({ activeMenuItem: null });

  setMenuContext(context);
</script>

<Surface style="padding: 4px 0px;">
  <div class="menu" {...others}>{@render children?.()}</div>
</Surface>

<style>
  .menu {
    height: auto;
    max-height: 70vh;
    transition: max-height 1s ease-out;
    overflow: hidden;
  }
</style>
