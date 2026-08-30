<script lang="ts">
  import type { Snippet } from "svelte";

  interface SwitchProps {
    checked?: boolean;
    children?: Snippet;
    divRef?: HTMLDivElement;
    id: string;
    onchange?: (checked: boolean) => void;
  }

  let {
    checked = $bindable(false),
    children,
    divRef = $bindable(),
    id,
    onchange,
  }: SwitchProps = $props();

  const switchId = $derived(`switch-${id}`);
</script>

<div bind:this={divRef} class="switch-module">
  <input
    type="checkbox"
    id={switchId}
    bind:checked
    class="switch-input"
    onchange={() => onchange?.(checked)}
  />

  <label for={switchId} class="switch-btn">
    <div
      class="face top top-contents"
      style={checked ? "--color-text-primary: var(--color-text-primary-shadowed);" : ""}
    >
      {@render children?.()}
    </div>
    <span class="face front"></span>
  </label>
</div>

<style>
  .switch-module {
    position: relative;
    width: var(--switch-width);
    height: var(--switch-height);
    user-select: none;
  }

  .switch-input {
    display: none;
  }

  .switch-btn {
    position: absolute;
    top: calc(var(--switch-z) * -0.5);
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .top-contents {
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .face {
    position: absolute;
    width: 100%;
    box-sizing: border-box;
    transition: transform 0.1s ease-out;
  }

  .face.top {
    height: 100%;
    background: var(--color-bg-surface);
    box-shadow: 
      /* Reflective border on edges for bevelled effect */
      inset -2px 0 1px 1px rgba(100, 100, 100, 0.6),
      /* Soft inner shadow from border edges */ inset 0 0 8px 8px rgba(100, 100, 100, 0.1),
      /* Outer shadow */ -6px 8px 16px rgba(0, 0, 0, 0.25);
    z-index: 2;
  }

  .face.front {
    height: var(--switch-z);
    bottom: calc(var(--switch-z) * -1);
    background: var(--color-bg-surface-side);
    /* Shadow between switch housing and side of switch */
    box-shadow: inset 0 -1px 2px rgba(0, 0, 0, 0.25);
    z-index: 1;
  }

  .switch-input:checked + .switch-btn .face.top {
    transform: translateY(calc(var(--switch-z) * 0.5));
    background: var(--color-bg-surface-shadowed);
    border-bottom-color: var(--color-bg-surface-side);
    box-shadow:
      /* Softer reflective bevelled edges */
      inset -1px 0 1px 1px rgba(100, 100, 100, 0.4),
      /* Soft inner shadow from border edges */ inset 0 0 8px 8px rgba(100, 100, 100, 0.1),
      /* Outer shadow */ -6px 8px 16px rgba(0, 0, 0, 0.06);
  }

  .switch-input:checked + .switch-btn .face.front {
    transform: scaleY(calc(var(--switch-z) * 0.5));
  }
</style>
