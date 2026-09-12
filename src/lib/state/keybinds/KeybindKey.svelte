<script lang="ts">
  import { Icon } from "../../components";

  interface KeybindKeyProps {
    key: string;
  }

  let { key }: KeybindKeyProps = $props();
</script>

<div class="keybind-key">
  {#if key === "Backspace"}
    <Icon name="backspace" />
  {:else if key === "Left-Click"}
    <Icon name="mouse-left-click" />
  {:else}
    {key === "Control" ? "Ctrl" : key}
  {/if}
</div>

<style>
  .keybind-key {
    background: var(--color-bg-surface);
    padding: 1px;
    border: 1px solid var(--color-surface-border);
    border-radius: 4px;
    display: flex;
    align-items: center;
  }
</style>
