<script lang="ts">
  import type { Snippet } from "svelte";

  interface SwitchHousingProps {
    children?: Snippet;
    switchHeight?: string;
    switchWidth?: string;
    switchZ?: string;
  }

  let {
    children,
    switchHeight = "32px",
    switchWidth = "32px",
    switchZ = "10px",
  }: SwitchHousingProps = $props();
</script>

<div class="switch-housing" style="--switch-z: {switchZ};">
  <div class="switch-track" style="--switch-width: {switchWidth}; --switch-height: {switchHeight};">
    {@render children?.()}
  </div>
</div>

<style>
  .switch-housing {
    display: inline-block;
    border-radius: 6px;
    border-width: 1px;
    margin: 8px;
  }

  .switch-track {
    display: flex;
    gap: 2px;
    background: var(--color-analog-well);
    padding: 0px 1px calc(var(--switch-z) * 0.5) 1px;
    border-radius: 4px;
  }

  :global(.switch-track .switch-module:first-of-type span.front.face) {
    border-bottom-left-radius: 3px;
  }

  :global(.switch-track .switch-module:last-of-type span.front.face) {
    border-bottom-right-radius: 3px;
  }
</style>
