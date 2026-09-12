<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import Icon from "../icon/Icon.svelte";
  import Popper from "../Popper.svelte";
  import Menu from "./Menu.svelte";
  import { getMenuContext } from "./menuContext.svelte";

  interface SubMenuEntryProps extends HTMLAttributes<HTMLDivElement> {
    menu?: Snippet;
  }

  let { children, menu, ...others }: SubMenuEntryProps = $props();

  const menuContext = getMenuContext();
  const id = Symbol();
</script>

<div
  class="sub-menu-entry {menuContext.activeMenuItem === id ? 'hovered' : ''}"
  {...others}
  onmouseenter={() => (menuContext.activeMenuItem = id)}
>
  {@render children?.()}
  <Icon style="margin-left: 6px;" name="caret-right" />
</div>
<Popper open={menuContext.activeMenuItem === id} side="right" offset={1}>
  <Menu>
    {@render menu?.()}
  </Menu>
</Popper>

<style>
  .sub-menu-entry {
    padding: 4px;
    user-select: none;
    display: flex;
    align-items: center;
  }

  .sub-menu-entry.hovered {
    background: var(--color-bg-surface-highlight);
  }
</style>
