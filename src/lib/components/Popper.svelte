<script lang="ts">
  import type { Attachment } from "svelte/attachments";

  import { onMount, type Snippet } from "svelte";

  import { type Position } from "../util";
  import Portal from "./Portal.svelte";

  type PopperAlignment = "end" | "middle" | "start";
  type PopperSide = "bottom" | "left" | "right" | "top";

  interface PopperProps {
    alignment?: PopperAlignment;
    anchor?: HTMLElement;
    children?: Snippet;
    offset?: number;
    open?: boolean;
    side?: PopperSide;
    sticky?: boolean;
  }

  let {
    alignment = "start",
    anchor,
    children,
    offset = 5,
    open = $bindable(true),
    side = "bottom",
    sticky = false,
  }: PopperProps = $props();

  let ref = $state<HTMLDivElement>();
  let windowWidth = $state(window.innerWidth);

  const findAnchor: Attachment = (element) => {
    if (anchor === undefined) {
      anchor = element.previousElementSibling as HTMLElement;

      if (!anchor) {
        console.warn("Failed to locate anchor above popper");
      }
    }
  };

  const handleResize = () => {
    windowWidth = window.innerWidth;
  };

  const handleStickyClose = (e: PointerEvent) => {
    if (!anchor?.contains(e.target as Node) && !ref?.contains(e.target as Node)) {
      open = false;
    }
  };

  onMount(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  $effect(() => {
    if (open && !sticky) {
      window.addEventListener("click", handleStickyClose);
    }
    return () => window.removeEventListener("click", handleStickyClose);
  });

  const position = $derived.by<Position>(() => {
    if (!open || windowWidth === 0 || !ref || !anchor) {
      if (!anchor && ref && open) {
        console.warn("Anchor not provided:", ref);
      }

      return { left: -100, top: -100 };
    }

    const rect = anchor.getBoundingClientRect();
    const popperWidth = ref.offsetWidth;
    const popperHeight = ref.offsetHeight;
    const pos = { left: 0, top: 0 };

    if (side === "top" || side === "bottom") {
      if (alignment === "start") {
        pos.left = rect.left;
      } else if (alignment === "middle") {
        pos.left = rect.left + rect.width / 2 - popperWidth / 2;
      } else {
        pos.left = rect.right - popperWidth;
      }

      if (side === "top") {
        pos.top = rect.top - offset - popperHeight;
      } else {
        pos.top = rect.bottom + offset;
      }
    } else {
      if (alignment === "start") {
        pos.top = rect.top;
      } else if (alignment === "middle") {
        pos.top = rect.top + rect.height / 2 - popperHeight / 2;
      } else {
        pos.top = rect.bottom - popperHeight;
      }

      if (side === "left") {
        pos.left = rect.left - offset - popperWidth;
      } else {
        pos.left = rect.right + offset;
      }
    }

    return pos;
  });
</script>

{#if open}
  <Portal {@attach findAnchor}>
    <div class="popper" bind:this={ref} style:top="{position.top}px" style:left="{position.left}px">
      {@render children?.()}
    </div>
  </Portal>
{/if}

<style>
  .popper {
    position: fixed;
    z-index: 9999;
  }
</style>
