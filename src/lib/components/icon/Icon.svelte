<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  import type { IconName } from "./icon-types";

  export interface IconProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    color?: string;
    maxSize?: string;
    name: IconName;
    size?: string;
    strokeColor?: string;
    strokeWidth?: string;
  }
</script>

<script lang="ts">
  let {
    className,
    color = "var(--color-text-primary)",
    maxSize,
    name,
    size = "1em",
    strokeColor = "var(--color-text-primary)",
    strokeWidth = "0px",
    style: propStyle,
  }: IconProps = $props();

  const icons = import.meta.glob("../../../assets/icons/*.svg", {
    eager: true,
    import: "default",
    query: "?raw",
  }) as Record<string, string>;

  const iconRaw = $derived(icons[`../../../assets/icons/${name}.svg`]);
</script>

<div
  class="icon {className}"
  style="width: {size}; height: {size};{maxSize !== undefined
    ? ` max-width: ${maxSize}; max-height: ${maxSize};`
    : ''} {propStyle}"
  style:--icon-color={color}
  style:--stroke-color={strokeColor}
  style:--stroke-width={strokeWidth}
>
  {#if iconRaw}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html iconRaw}
  {:else}
    <span style="color: red;">□</span>
  {/if}
</div>

<style>
  .icon :global(svg) {
    width: 100%;
    height: 100%;
    fill: var(--icon-color);
    stroke: var(--stroke-color);
    stroke-width: var(--stroke-width);
  }

  .icon {
    display: flex;
    align-items: center;
  }
</style>
