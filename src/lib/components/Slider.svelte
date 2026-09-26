<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface SliderProps extends HTMLInputAttributes {
    value?: number;
  }

  let { step, value = $bindable(), ...others }: SliderProps = $props();
</script>

<input type="range" bind:value step={step ?? "any"} {...others} />

<style>
  input[type="range"] {
    appearance: none;
    background: var(--color-bg-surface-side);
    height: 1em;
    border: 1px solid var(--color-surface-border);
    padding: 1px 0px 1px;
  }

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    height: calc(1em + 2px);
    width: 5px;
    cursor: pointer;
    background: var(--color-highlight-blue);
  }
</style>
