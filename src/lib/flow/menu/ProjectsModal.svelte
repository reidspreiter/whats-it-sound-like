<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";

  import { Button, Checkbox, Modal, TextWithRename } from "../../components";
  import {
    deleteProject,
    getProjects,
    openProject,
    type Project,
    renameProject,
  } from "../../state";
  import ExportModal from "./ExportModal.svelte";
  import ImportModal from "./ImportModal.svelte";
  import NewProjectModal from "./NewProjectModal.svelte";

  interface ProjectsModalProps {
    open?: boolean;
  }

  let { open = $bindable(false) }: ProjectsModalProps = $props();

  let newProjectModalOpen = $state(false);
  let importModalOpen = $state(false);
  let exportModalOpen = $state(false);
  let projects = $state<[string, Project][]>([]);
  let selectedIds = new SvelteSet<string>();

  $effect(() => {
    if (open) {
      refresh();
    }
  });

  const refresh = async () => {
    selectedIds.clear();
    projects = await getProjects();
  };

  const fmtDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };
</script>

<Modal bind:open>
  <h3>Projects</h3>
  <Button
    iconName="plus"
    onclick={() => {
      newProjectModalOpen = true;
      open = false;
    }}>New</Button
  >
  <Button
    iconName="import"
    onclick={() => {
      importModalOpen = true;
      open = false;
    }}>Import</Button
  >
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th></th>
          <th
            ><Checkbox
              checked={selectedIds.size === projects.length}
              onchange={(e) => {
                if (e.currentTarget.checked) {
                  projects.map(([id]) => {
                    selectedIds.add(id);
                  });
                } else {
                  selectedIds.clear();
                }
              }}
            /></th
          >
          <th style="text-align: left;">Name</th>
          <th style="text-align: right;"
            ><p>Nodes</p>
            <p>Cables</p></th
          >
          <th
            ><p>Accessed</p>
            <p>Created</p></th
          >
        </tr>
      </thead>
      <tbody>
        {#each projects as [id, info] (id)}
          <tr>
            <td
              ><Button
                iconName="folder-open"
                onclick={() => {
                  openProject(id);
                  open = false;
                }}>Open</Button
              ></td
            >
            <td
              ><Checkbox
                checked={selectedIds.has(id)}
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    selectedIds.add(id);
                  } else {
                    selectedIds.delete(id);
                  }
                }}
              /></td
            >
            <td>
              <TextWithRename
                text={info.title}
                onRename={async (newName) => await renameProject(id, newName)}
              />
            </td>
            <td style="text-align: right;">{info.nodes.length} : {info.cables.length}</td>
            <td style="text-align: center;"
              >{fmtDate(info.dateAccessed)} : {fmtDate(info.dateCreated)}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <Button
    iconName="export"
    disabled={selectedIds.size <= 0}
    onclick={() => {
      exportModalOpen = true;
      open = false;
    }}>Export</Button
  >
  <Button
    iconName="trash"
    disabled={selectedIds.size <= 0}
    onclick={async () => {
      const promises = [];

      for (const id of selectedIds) {
        promises.push(deleteProject(id));
      }

      await Promise.all(promises);
      refresh();
    }}>Delete</Button
  >
</Modal>

<NewProjectModal
  bind:open={newProjectModalOpen}
  onclose={() => {
    open = true;
    refresh();
  }}
/>

<ImportModal
  bind:open={importModalOpen}
  onclose={() => {
    open = true;
    refresh();
  }}
/>

<ExportModal
  bind:open={exportModalOpen}
  onclose={() => {
    open = true;
    refresh();
  }}
  ids={[...selectedIds.values()]}
/>

<style>
  table {
    border-collapse: collapse;
    border-spacing: 10px 0px;
  }

  th {
    font-weight: normal;
  }

  th,
  td {
    padding-right: 10px;
  }

  thead {
    border-bottom: solid 1px var(--color-surface-border);
  }

  .table-container {
    overflow-y: auto;
    max-height: 50vw;
    margin: 10px 0;
  }
</style>
