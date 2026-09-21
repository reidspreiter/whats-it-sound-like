<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { IconButton, Portal, Surface } from ".";

  interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet;

    /** If true, clicking outside of the modal will not close it */
    locked?: boolean;
    onclose?: () => void;
    open?: boolean;
  }

  let {
    children,
    locked = false,
    onclose,
    open = $bindable(false),
    style,
    ...others
  }: ModalProps = $props();

  let initialized = false;
  $effect(() => {
    if (!open && initialized) {
      onclose?.();
    } else if (!initialized) {
      initialized = true;
    }
  });
</script>

{#if open}
  <Portal
    class="modal"
    role="dialog"
    aria-modal
    onclick={() => {
      open = locked;
    }}
  >
    <Surface
      onclick={(e) => e.stopPropagation()}
      style="position: relative; max-width: 90vw; max-height: 90vh;{style}"
      {...others}
    >
      <IconButton
        style="position: absolute; top: 2px; right: 2px;"
        name="x-circle"
        onclick={() => {
          open = false;
        }}
        aria-label="close"
      />
      {@render children?.()}
    </Surface>
  </Portal>
{/if}

<style>
  :global(.modal) {
    position: fixed;
    display: flex;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.47);
  }
</style>
