<script lang="ts">
  import {
    Checkbox,
    Menu,
    MenuDivider,
    MenuHeader,
    MenuItem,
    Popper,
    Slider,
    SubMenu,
    TextField,
  } from "../../components";
  import { activeProject, getProjects, openProject, preferences } from "../../state";
  import { clamp } from "../../util";
  import ExportModal from "./ExportModal.svelte";
  import NewProjectModal from "./NewProjectModal.svelte";
  import ProjectsModal from "./ProjectsModal.svelte";

  type Button = "edit" | "file" | "help" | "view";

  let fileOpen = $state(false);
  let editOpen = $state(false);
  let viewOpen = $state(false);
  let helpOpen = $state(false);

  let newProjectModalOpen = $state(false);
  let exportModalOpen = $state(false);
  let projectsModalOpen = $state(false);

  const handleClickEvent = (button: Button, open: boolean) => {
    fileOpen = open && button == "file";
    editOpen = open && button == "edit";
    viewOpen = open && button == "view";
    helpOpen = open && button == "help";
  };
</script>

<div class="menu-bar">
  <button class="menu-button" onclick={() => handleClickEvent("file", !fileOpen)}>File</button>
  <Popper bind:open={fileOpen}>
    <Menu>
      <MenuItem
        onclick={() => {
          newProjectModalOpen = true;
          fileOpen = false;
        }}>New</MenuItem
      >
      <SubMenu>
        Open Recent

        {#snippet menu()}
          {#await getProjects(5)}
            loading...
          {:then projects}
            {#each projects as [id, info] (id)}
              {#if id !== activeProject.id}
                <MenuItem onclick={async () => await openProject(id)}>{info.title}</MenuItem>
              {/if}
            {/each}
          {/await}
        {/snippet}
      </SubMenu>
      <MenuDivider />
      <MenuItem
        onclick={() => {
          fileOpen = false;
          exportModalOpen = true;
        }}>Export</MenuItem
      >
      <MenuDivider />
      <MenuItem
        onclick={() => {
          fileOpen = false;
          projectsModalOpen = true;
        }}>Projects</MenuItem
      >
    </Menu>
  </Popper>
  <button class="menu-button" onclick={() => handleClickEvent("edit", !editOpen)}>Edit</button>
  <Popper bind:open={editOpen}>
    <Menu>
      <MenuItem>Undo</MenuItem>
      <MenuItem>Redo</MenuItem>
    </Menu>
  </Popper>
  <button class="menu-button" onclick={() => handleClickEvent("view", !viewOpen)}>View</button>
  <Popper bind:open={viewOpen}>
    <Menu>
      <MenuItem
        style="display: flex; align-items: center;"
        onclick={() => (preferences.showKeybindHints = !preferences.showKeybindHints)}
      >
        <Checkbox bind:checked={preferences.showKeybindHints} />Show Keybind Hints
      </MenuItem>
      <MenuHeader>Cables</MenuHeader>
      <MenuDivider />
      <MenuItem type="text">
        Opacity:
        <div class="menu-slider">
          <Slider bind:value={preferences.cableOpacity} min={0} max={1} />
          <TextField
            style="width: 4em;"
            value={(preferences.cableOpacity * 100).toFixed(2)}
            onchange={(e) => {
              const num = clamp(parseFloat(e.currentTarget?.value ?? 0) / 100, 0, 1);
              preferences.cableOpacity = isNaN(num) ? 0 : num;
            }}
          />
        </div>
      </MenuItem>
      <MenuItem type="text">
        Tension:
        <div class="menu-slider">
          <Slider bind:value={preferences.cableTension} min={0} max={1} />
          <TextField
            style="width: 4em;"
            value={(preferences.cableTension * 100).toFixed(2)}
            onchange={(e) => {
              const num = clamp(parseFloat(e.currentTarget?.value ?? 0) / 100, 0, 1);
              preferences.cableTension = isNaN(num) ? 0 : num;
            }}
          />
        </div>
      </MenuItem>
      <MenuDivider />
    </Menu>
  </Popper>
  <button class="menu-button" onclick={() => handleClickEvent("help", !helpOpen)}>Help</button>
  <Popper bind:open={helpOpen}>
    <Menu>
      <MenuItem type="text">Coming soon...</MenuItem>
    </Menu>
  </Popper>
</div>

<NewProjectModal bind:open={newProjectModalOpen} />
<ExportModal
  bind:open={exportModalOpen}
  ids={activeProject.id !== null ? [activeProject.id] : []}
/>
<ProjectsModal bind:open={projectsModalOpen} />

<style>
  .menu-bar {
    padding: 4px;
    gap: 4px;
    display: flex;
  }

  .menu-button {
    border: none;
    border-radius: 999px;
    cursor: pointer;
    background: var(--color-bg-surface);
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    padding: 2px 6px;
  }

  .menu-slider {
    display: flex;
    align-items: center;
  }
</style>
