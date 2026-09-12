<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface TextFieldProps extends HTMLInputAttributes {
    value?: unknown;
  }

  let { value = $bindable(), ...others }: TextFieldProps = $props();
</script>

<input type="text" bind:value {...others} />

<style>
  input[type="text"] {
    border: 1px solid var(--color-surface-border);
    height: 1em;
    font-family: inherit;
    color: inherit;
    background: var(--color-bg-surface-side);
    padding: 1px;
  }
</style>
