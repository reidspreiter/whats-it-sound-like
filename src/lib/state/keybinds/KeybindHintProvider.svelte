<script lang="ts" module>
  import type { Attachment } from "svelte/attachments";

  import { KeybindKey, Portal } from "../../components";
  import { type Keybind, preferences } from "../../state";

  export interface KeybindHintInfo {
    description: string;
    keybind: Keybind;
  }

  export type KeybindHintContent = Record<string, KeybindHintInfo>;

  interface KeybindHintState {
    content: KeybindHintContent;
  }

  const keybindHintState = $state<KeybindHintState>({
    content: {},
  });

  export const addKeybindHint = (id: string, info: KeybindHintInfo) => {
    keybindHintState.content[id] = info;
  };

  export const removeKeybindHint = (id: string) => {
    delete keybindHintState.content[id];
  };

  export const keybindHint = (content: KeybindHintContent): Attachment => {
    return (element) => {
      const onMouseLeave = () => {
        for (const id in content) {
          removeKeybindHint(id);
        }
        keybindHintState.content = {};
      };

      const onMouseEnter = () => {
        for (const [id, info] of Object.entries(content)) {
          addKeybindHint(id, info);
        }
      };

      element.addEventListener("mouseenter", onMouseEnter);
      element.addEventListener("mouseleave", onMouseLeave);

      return () => {
        element.removeEventListener("mouseenter", onMouseEnter);
        element.removeEventListener("mouseleave", onMouseLeave);
        onMouseLeave();
      };
    };
  };
</script>

{#if preferences.showKeybindHints && Object.entries(keybindHintState.content).length > 0}
  <Portal class="keybind-hint">
    {#each Object.entries(keybindHintState.content) as [id, info] (id)}
      <div class="keybind-hint-entry">
        {#each info.keybind as key, i (i)}
          <KeybindKey {key} />
          {#if i + 1 < info.keybind.length}
            +
          {/if}
        {/each}
        {info.description}
      </div>
    {/each}
  </Portal>
{/if}

<style>
  :global(.keybind-hint) {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 9998;
    max-width: 26em;
    word-wrap: break-word;
    font-size: 14px;
    padding-top: 4px;
    padding-right: 4px;
  }

  .keybind-hint-entry {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-bottom: 2px;
  }
</style>
