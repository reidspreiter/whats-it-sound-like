<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface CheckboxProps extends HTMLAttributes<HTMLDivElement> {
    checked?: boolean;
  }

  let { checked = $bindable(false), ...others }: CheckboxProps = $props();
</script>

<input type="checkbox" bind:checked {...others} />

<style>
  input[type="checkbox"] {
    appearance: none;
    height: 1em;
    width: 1em;
    background: var(--color-bg-surface-side);
    border: 1px solid var(--color-surface-border);
    cursor: pointer;
    display: grid;
    place-content: center;
  }

  input[type="checkbox"]:checked::before {
    content: "";
    width: 0.5em;
    height: 0.5em;
    background: var(--color-highlight-blue);
  }
</style>
