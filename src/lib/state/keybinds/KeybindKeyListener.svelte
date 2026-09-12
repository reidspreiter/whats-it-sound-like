<script lang="ts">
  import { keyboundKeys, keysPressed } from "../../state";
</script>

<svelte:window
  onkeydown={(e) => {
    const target = e.target as HTMLElement;
    if (
      keyboundKeys.has(e.key) &&
      (!target ||
        (!target.isContentEditable &&
          target.tagName !== "TEXTAREA" &&
          (target.tagName !== "INPUT" || (target as HTMLInputElement).type !== "text")))
    ) {
      keysPressed.add(e.key);
      e.preventDefault();
    }
  }}
  onkeyup={(e) => {
    keysPressed.delete(e.key);
  }}
/>
