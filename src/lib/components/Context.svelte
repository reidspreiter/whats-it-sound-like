<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { MouseEventHandler } from "svelte/elements";

  import type { Position } from "../util";

  import Portal from "./Portal.svelte";

  interface ContextProps {
    /**
     * Anchor to listen for context actions on.
     * - If `undefined`, an anchor will automatically be found.
     * - If `null`, no anchor will be used, and it is expected for the parent component
     * to call this component's `handleContext` function.
     */
    anchor?: HTMLElement | null;
    children?: Snippet;
  }

  let { anchor, children }: ContextProps = $props();

  let mousePos = $state({ x: -999, y: -999 });
  let ref = $state<HTMLDivElement>();

  const open = $derived(!(mousePos.x === -999 && mousePos.y === -999));

  const position = $derived.by<Position>(() => {
    if (!open || !ref) {
      return { left: mousePos.x, top: mousePos.y };
    }

    const menuBottom = mousePos.y + ref.offsetHeight;
    const menuRight = mousePos.x + ref.offsetWidth;

    return {
      left:
        menuRight > window.innerWidth
          ? mousePos.x - (mousePos.x + ref.offsetWidth - window.innerWidth + 1)
          : mousePos.x,
      top:
        menuBottom > window.innerHeight
          ? mousePos.y - (menuBottom - window.innerHeight + 1)
          : mousePos.y,
    };
  });

  $effect(() => {
    if (anchor !== null) {
      anchor?.addEventListener("contextmenu", handleContext);

      return () => anchor?.removeEventListener("contextmenu", handleContext);
    }
  });

  const findAnchor: Attachment = (element) => {
    if (anchor === undefined) {
      anchor = element.previousElementSibling as HTMLElement;

      if (!anchor) {
        console.warn("Failed to locate anchor above context");
      }
    }
  };

  export const handleContext = (e: MouseEvent) => {
    e.preventDefault();
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  };

  export const getPos = (): Position => {
    return { left: mousePos.x, top: mousePos.y };
  };

  export const close = () => {
    mousePos.x = -999;
    mousePos.y = -999;
  };

  const handleClose: MouseEventHandler<Window> = (e) => {
    if (!ref?.contains(e.target as Node)) {
      close();
    }
  };
</script>

<div {@attach findAnchor}></div>

{#if open}
  <Portal>
    <div
      bind:this={ref}
      class="context"
      style:top="{position.top}px"
      style:left="{position.left}px"
    >
      {@render children?.()}
    </div>
  </Portal>
{/if}

<svelte:window onclick={open ? handleClose : undefined} />

<style>
  .context {
    position: fixed;
    z-index: 9999;
  }
</style>
