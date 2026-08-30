<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import type { IconName } from "./icon-types";
  interface IconProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    color?: string;
    maxSize?: string;
    name: IconName;
    size?: string;
    strokeColor?: string;
    strokeWidth?: string;
  }

  let {
    className,
    color = "var(--color-text-primary)",
    maxSize = "1em",
    name,
    size = "100%",
    strokeColor = "var(--color-text-primary)",
    strokeWidth = "0px",
    style: propStyle,
  }: IconProps = $props();

  const icons = import.meta.glob("../../assets/icons/*.svg", {
    eager: true,
    import: "default",
    query: "?raw",
  }) as Record<string, string>;

  const iconRaw = $derived(icons[`../../assets/icons/${name}.svg`]);
</script>

<div
  class="icon {className}"
  style="width: {size}; height: {size}; max-width: {maxSize}; max-height: {maxSize}; {propStyle}"
  style:--icon-color={color}
  style:--stroke-color={strokeColor}
  style:--stroke-width={strokeWidth}
>
  {#if iconRaw}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html iconRaw}
  {:else}
    <span>{name} not found</span>
  {/if}
</div>

<style>
  .icon :global(svg) {
    width: 100%;
    height: 100%;
    fill: var(--icon-color);
    stroke: var(--stroke-color);
    stroke-width: var(--stroke-width);

    /* Align with text */
    vertical-align: middle;
    position: relative;
    top: -0.05em;
  }
</style>
