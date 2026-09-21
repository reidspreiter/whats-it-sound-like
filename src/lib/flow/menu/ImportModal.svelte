<script lang="ts">
  import { Button, Modal } from "../../components";
  import { importProjects } from "../../state";

  interface ImportModalProps {
    onclose?: () => void;
    open?: boolean;
  }

  let { onclose, open = $bindable(false) }: ImportModalProps = $props();

  let importText = $state("");

  $effect(() => {
    if (open) {
      importText = "";
    }
  });
</script>

<Modal bind:open {onclose}>
  <h3>Import</h3>
  <textarea bind:value={importText} placeholder="Paste project contents here..."></textarea>
  <Button
    onclick={() => {
      importProjects(importText);
      open = false;
    }}
    iconName="import">Import</Button
  >
</Modal>

<style>
  textarea {
    width: 100%;
    resize: none;
    box-sizing: border-box;
    overflow-y: auto;
    height: 30vh;
  }
</style>
