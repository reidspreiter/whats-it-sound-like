<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { Icon, type IconName } from "./icon";

  interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
    disabled?: boolean;
    iconName?: IconName;
  }

  let { children, disabled = false, iconName, style, ...others }: ButtonProps = $props();
</script>

<button
  {disabled}
  aria-disabled={disabled}
  style="{iconName === undefined
    ? ''
    : 'display: inline-flex; gap: 4px; align-items: center;'}{style}"
  {...others}
  >{#if iconName !== undefined}<Icon name={iconName} />{/if}{@render children?.()}</button
>

<style>
  button {
    all: unset;
    background: var(--color-highlight-blue);
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
  }

  button:disabled {
    background: var(--color-bg-surface-highlight);
    color: var(--color-text-primary-shadowed);
    cursor: default;
  }
</style>
