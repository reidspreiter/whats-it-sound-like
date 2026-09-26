<script lang="ts" generics="T extends number | string">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface RadioProps<T> extends Omit<HTMLInputAttributes, "group" | "value"> {
    group: T;
    value: T;
  }

  let { group = $bindable(), value, ...others }: RadioProps<T> = $props();
</script>

<input type="radio" bind:group {value} {...others} />

<style>
  input[type="radio"] {
    appearance: none;
    height: 1em;
    width: 1em;
    background: var(--color-bg-surface-side);
    border: 1px solid var(--color-surface-border);
    border-radius: 50%;
    cursor: pointer;
    display: grid;
    place-content: center;
  }

  input[type="radio"]:checked::before {
    content: "";
    width: 0.5em;
    height: 0.5em;
    background: var(--color-highlight-blue);
    border-radius: 50%;
  }
</style>
