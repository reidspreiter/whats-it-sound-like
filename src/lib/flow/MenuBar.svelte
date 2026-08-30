<script lang="ts">
  import { Menu, MenuDivider, MenuItem, Popper, SubMenu } from "../components";

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
      <MenuItem type="text">Coming soon...</MenuItem>
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
</style>
