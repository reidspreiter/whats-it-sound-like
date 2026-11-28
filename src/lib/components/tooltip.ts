import type { Action } from "svelte/action";

import { preferences } from "../state";

export interface TooltipAttributes {
  /**
   * Denotes if this is an essential tooltip or not
   */
  essential?: boolean;

  /**
   * Text displayed in the tooltip. If undefined, the tooltip is completely disabled
   */
  text?: string;
}

export const tooltip: Action<HTMLElement, TooltipAttributes> = (element, attributes) => {
  let div: HTMLDivElement | null = null;
  let currText = attributes.text;
  const essential = attributes.essential ?? false;
  let timeout: number | undefined = undefined;

  const enableTooltip = () => {
    element.addEventListener("mouseenter", mouseEnter);
    element.addEventListener("mouseleave", mouseLeave);
  };

  const disableTooltip = () => {
    element.removeEventListener("mouseenter", mouseEnter);
    element.removeEventListener("mouseleave", mouseLeave);
    mouseLeave();
  };

  const mouseMove = () => {
    if (div) {
      const rect = element.getBoundingClientRect();
      const { offsetHeight, offsetWidth } = div;
      const tooltipOffset = 8;

      const left =
        rect.left < 0
          ? 0
          : rect.left + offsetWidth > window.innerWidth
            ? Math.max(0, window.innerWidth - offsetWidth - 1)
            : rect.left;

      const top =
        rect.top - offsetHeight < 0
          ? rect.bottom + tooltipOffset
          : rect.top - offsetHeight - tooltipOffset;

      div.style.left = `${left}px`;
      div.style.top = `${top}px`;
    } else {
      mouseLeave();
    }
  };

  const mouseLeave = () => {
    div?.remove();
    div = null;
    clearTimeout(timeout);
    element.removeEventListener("mousemove", mouseMove);
  };

  const mouseEnter = () => {
    // Clean up existing tooltip
    mouseLeave();

    // Don't display tooltip if they are completely disabled or if this tooltip is not considered essential
    if (
      preferences.tooltipDetail === "none" ||
      (preferences.tooltipDetail === "essential" && !essential) ||
      currText === undefined
    ) {
      return;
    }

    timeout = setTimeout(() => {
      if (currText !== undefined) {
        div = document.createElement("div");
        div.textContent = currText;

        Object.assign(div.style, {
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-surface-border)",
          borderRadius: "4px",
          boxShadow: "1px 1px 1px var(--color-bg-surface)",
          left: `0`,
          padding: "4px",
          pointerEvents: "none",
          position: "absolute",
          top: `0`,
          visibility: "hidden",
        });

        // Append hidden tooltip to the page so we can calculate its dimensions and ensure
        // it is positioned correctly
        document.body.appendChild(div);

        mouseMove();

        element.addEventListener("mousemove", mouseMove);

        div.style.visibility = "visible";
      } else {
        disableTooltip();
      }
    }, 100);
  };

  if (currText !== undefined) {
    enableTooltip();
  }

  return {
    destroy() {
      disableTooltip();
    },
    update(attributes) {
      const prevText = currText;
      currText = attributes.text;

      const currEssential = attributes.essential ?? false;

      if (currText !== undefined) {
        if (prevText === undefined) {
          enableTooltip();
        }

        if (currEssential !== essential) {
          mouseEnter();
        } else {
          if (div) {
            div.textContent = currText;
          }
        }
      } else {
        disableTooltip();
      }
    },
  };
};
