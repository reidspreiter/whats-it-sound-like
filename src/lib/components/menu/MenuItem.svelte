<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { getMenuContext } from "./menuContext.svelte";

  type MenuItemType = "button" | "text";

  interface MenuItemProps extends HTMLAttributes<HTMLDivElement> {
    type?: MenuItemType;
  }

  let { children, type = "button", ...others }: MenuItemProps = $props();

  const menuContext = getMenuContext();
  const id = Symbol();

  const getClassNameForType = (type: MenuItemType) => {
    return `menu-item-${type}`;
  };
</script>

<div
  class="menu-item {getClassNameForType(type)}"
  {...others}
  onmouseenter={type !== "text"
    ? () => {
        menuContext.activeMenuItem = id;
      }
    : undefined}
>
  {@render children?.()}
</div>

<style>
  .menu-item {
    padding: 4px;
    user-select: none;
  }

  .menu-item-button {
    cursor: pointer;

    &:hover {
      background: var(--color-bg-surface-highlight);
    }
  }
</style>
