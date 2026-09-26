<script lang="ts">
  import { useStore, useSvelteFlow } from "@xyflow/svelte";

  import {
    Checkbox,
    KeybindKey,
    Menu,
    MenuDivider,
    MenuHeader,
    MenuItem,
    Popper,
    Radio,
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

  let { fitView, setZoom } = useSvelteFlow();

  const store = useStore();

  let fileOpen = $state(false);
  let editOpen = $state(false);
  let viewOpen = $state(false);
  let helpOpen = $state(false);

  let newProjectModalOpen = $state(false);
  let exportModalOpen = $state(false);
  let projectsModalOpen = $state(false);

  const zoomPercentage = $derived(
    ((store.viewport.zoom - store.minZoom) / (store.maxZoom - store.minZoom)) * 100,
  );

  const setZoomFromPercentage = (zoomValue?: string) => {
    const percentage = clamp(parseFloat(zoomValue ?? "0") / 100, 0, 1);
    setZoom((store.maxZoom - store.minZoom) * percentage + store.minZoom);
  };

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
        onclick={() => {
          fitView();
          handleClickEvent("view", false);
        }}>Zoom to fit</MenuItem
      >
      <MenuItem type="text">
        Zoom:
        <div class="menu-slider">
          <Slider
            value={zoomPercentage}
            min={0}
            max={100}
            oninput={(e) => setZoomFromPercentage(e.currentTarget.value)}
          />
          <TextField
            style="width: 4em;"
            value={zoomPercentage.toFixed(2)}
            onchange={(e) => setZoomFromPercentage(e.currentTarget.value)}
          />
        </div>
      </MenuItem>
      <SubMenu>
        Navigation Style

        {#snippet menu()}
          <MenuItem onclick={() => (preferences.navigationStyle = "pan-on-drag")}
            ><div style="display: flex; align-items: start;">
              <Radio bind:group={preferences.navigationStyle} value="pan-on-drag" />
              <div>
                Pan on Drag
                <div class="navigation-keybind">
                  Pan
                  <div class="keybind">
                    (<KeybindKey key="Left-Click" />/<KeybindKey key="Middle-Click" />)+<KeybindKey
                      key="Drag"
                    />
                  </div>
                </div>
                <div class="navigation-keybind">
                  Zoom
                  <div class="keybind">
                    <KeybindKey key="Scroll" />/<KeybindKey key="Pinch" />
                  </div>
                </div>
                <div class="navigation-keybind">
                  Select
                  <div class="keybind">
                    <KeybindKey key="Shift" />+<KeybindKey key="Left-Click" />+<KeybindKey
                      key="Drag"
                    />
                  </div>
                </div>
              </div>
            </div>
          </MenuItem>
          <MenuItem onclick={() => (preferences.navigationStyle = "pan-on-scroll")}
            ><div style="display: flex; align-items: start;">
              <Radio bind:group={preferences.navigationStyle} value="pan-on-scroll" />
              <div>
                Pan on Scroll
                <div class="navigation-keybind">
                  Free Pan
                  <div class="keybind">
                    <KeybindKey key="Touchpad" />or(<KeybindKey key="Middle-Click" />/<KeybindKey
                      key="Space"
                    />)+<KeybindKey key="Drag" />
                  </div>
                </div>
                <div class="navigation-keybind">
                  Vertical Pan
                  <div class="keybind">
                    <KeybindKey key="Scroll" />
                  </div>
                </div>
                <div class="navigation-keybind">
                  Horizontal Pan
                  <div class="keybind">
                    <KeybindKey key="Shift" />+<KeybindKey key="Scroll" />
                  </div>
                </div>
                <div class="navigation-keybind">
                  Zoom
                  <div class="keybind">
                    <KeybindKey key="Pinch" />or<KeybindKey key="Ctrl" />+<KeybindKey
                      key="Scroll"
                    />
                  </div>
                </div>
                <div class="navigation-keybind">
                  Select
                  <div class="keybind">
                    <KeybindKey key="Left-Click" />+<KeybindKey key="Drag" />
                  </div>
                </div>
              </div>
            </div>
          </MenuItem>
        {/snippet}
      </SubMenu>
      <MenuDivider />
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

  .menu-slider,
  .navigation-keybind,
  .keybind {
    display: flex;
    align-items: center;
  }

  .keybind {
    margin-left: 8px;
    gap: 2px;
  }

  .navigation-keybind {
    justify-content: space-between;
    font-size: 12px;
  }
</style>
