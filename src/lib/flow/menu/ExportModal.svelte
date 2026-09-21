<script lang="ts">
  import { Button, Modal } from "../../components";
  import { exportProjects } from "../../state";

  interface ExportModalProps {
    ids?: string[];
    onclose?: () => void;
    open?: boolean;
  }

  let { ids, onclose, open = $bindable(false) }: ExportModalProps = $props();

  let exportText = $state("[]");

  const refreshExportText = async (idsToExport: string[]) => {
    exportText = await exportProjects(idsToExport);
  };

  $effect(() => {
    if (ids !== undefined && open) {
      refreshExportText(ids);
    } else {
      exportText = "[]";
    }
  });
</script>

<Modal bind:open {onclose} style="display: flex; flex-direction: column;">
  <h3>Export</h3>

  <textarea readonly value={exportText}></textarea>
  <div>
    <Button
      onclick={async () => await navigator.clipboard.writeText(exportText)}
      iconName="copy"
      style="margin-top: 10px;">Copy</Button
    >
  </div>
</Modal>

<style>
  textarea {
    field-sizing: content;
    resize: none;
    box-sizing: border-box;
    overflow-y: auto;
    max-height: 40vh;
  }
</style>
