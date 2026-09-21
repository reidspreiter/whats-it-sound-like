<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { IconButton, TextField } from ".";

  interface TextWithRenameProps {
    onRename?: (newName: string) => Promise<void> | void;
    text?: string;
    textProps?: HTMLAttributes<HTMLParagraphElement>;
  }

  let { onRename, text = $bindable(""), textProps }: TextWithRenameProps = $props();

  let renaming = $state(false);
  let renameText = $derived(text);
</script>

<div class="text-container">
  {#if renaming}
    <TextField bind:value={renameText} />
    <div style="display: flex; margin-left 8px;">
      <IconButton
        name="check"
        onclick={async () => {
          renaming = false;
          text = renameText;
          await onRename?.(text);
        }}
      /><IconButton
        name="trash"
        onclick={() => {
          renaming = false;
          renameText = text;
        }}
      />
    </div>
  {:else}
    <p {...textProps}>{text}</p>
    <IconButton style="margin-left: 8px;" name="pencil" onclick={() => (renaming = true)} />
  {/if}
</div>

<style>
  .text-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
