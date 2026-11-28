<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { Icon, type IconName, type IconProps } from "./icon";
  import { tooltip } from "./tooltip";

  interface IconButtonProps extends HTMLAttributes<HTMLButtonElement> {
    description?: string;
    iconProps?: Omit<IconProps, "name">;
    name: IconName;
  }

  let { description, iconProps, name, ...others }: IconButtonProps = $props();
</script>

<button use:tooltip={{ text: description }} {...others}><Icon {name} {...iconProps} /></button>

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
