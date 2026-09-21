<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { Icon, type IconName, type IconProps } from "./icon";

  interface IconButtonProps extends HTMLAttributes<HTMLButtonElement> {
    iconProps?: Omit<IconProps, "name">;
    name: IconName;
  }

  let { iconProps, name, ...others }: IconButtonProps = $props();
</script>

<button {...others}><Icon {name} {...iconProps} /></button>

<style>
  button {
    all: unset;
    border-radius: 50%;
    cursor: pointer;
    padding: 1px;
    height: min-content;
  }

  button:hover {
    background: var(--color-bg-surface-highlight);
  }
</style>
