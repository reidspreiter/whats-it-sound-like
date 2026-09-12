<script lang="ts">
  interface SliderProps {
    max?: number;
    min?: number;
    step?: number;
    value?: number;
  }

  let { max, min, step, value = $bindable() }: SliderProps = $props();
</script>

<input type="range" bind:value {min} {max} step={step ?? "any"} />

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
