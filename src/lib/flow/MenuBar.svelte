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
  } from "../components";
  import { preferences } from "../state";
  import { clamp } from "../util";

  type Button = "edit" | "file" | "help" | "view";

  let fileOpen = $state(false);
  let editOpen = $state(false);
  let viewOpen = $state(false);
  let helpOpen = $state(false);

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
      <MenuItem>New</MenuItem>
      <SubMenu>
        Open Recent

        {#snippet menu()}
          <MenuItem>Project Name</MenuItem>
        {/snippet}
      </SubMenu>
      <MenuDivider />
      <MenuItem>Import</MenuItem>
      <MenuItem>Export</MenuItem>
      <MenuDivider />
      <MenuItem>Projects</MenuItem>
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
