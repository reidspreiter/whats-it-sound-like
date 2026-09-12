import { SvelteSet } from "svelte/reactivity";

import type { BooleanMap } from "../../util";

export type Keybind = string[];

export interface Keybinds {
  addEdgeOnTop: Keybind;
  deleteSelected: Keybind;
  deleteTopCable: Keybind;
  selectCableEdge: Keybind;
}

/**
 * Keys to press to perform an action.
 *
 * Keybind state does not handle click events. These are easier to trigger
 * from component-specific event listeners.
 */
export const keybinds = $state<Keybinds>({
  addEdgeOnTop: ["Control"],
  deleteSelected: ["Backspace"],
  deleteTopCable: ["Shift"],
  selectCableEdge: ["e"],
});

/**
 * Which keybind-related keys are currently pressed
 */
export const keysPressed = new SvelteSet<string>();

/**
 * Which keys have keybinds associated with them
 */
export const keyboundKeys = new SvelteSet<string>(Object.values(keybinds).flat());

const makeKeybindFlags = (kb: Keybinds) => {
  const res: Record<string, false> = {};
  for (const keybind in kb) {
    res[keybind] = false;
  }
  return res as BooleanMap<Keybinds>;
};

/**
 * What keybind actions are pressed
 */
export const keybindFlags = $state<BooleanMap<Keybinds>>(makeKeybindFlags(keybinds));

const updateKeybindFlags = () => {
  for (const key in keybinds) {
    keybindFlags[key as keyof Keybinds] = keybinds[key as keyof Keybinds].every((v) =>
      keysPressed.has(v),
    );
  }
};

$effect.root(() => {
  $effect(() => {
    const _ = keysPressed.size;
    updateKeybindFlags();
  });
});
