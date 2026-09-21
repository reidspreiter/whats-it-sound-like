<script lang="ts">
  import { Button, Modal, TextField } from "../../components";
  import { createAndOpenNewProject } from "../../state";

  interface NewProjectModalProps {
    onclose?: () => void;
    open?: boolean;
  }

  let { onclose, open = $bindable(false) }: NewProjectModalProps = $props();

  let newProjectTitle = $state("My new project");

  $effect(() => {
    if (open) {
      newProjectTitle = "My new project";
    }
  });
</script>

<Modal bind:open {onclose}>
  <h3>New Project</h3>
  <label for="new-project-title">Title:</label>
  <br />
  <TextField id="new-project-title" bind:value={newProjectTitle} />
  <br />
  <Button
    disabled={newProjectTitle.length < 1}
    onclick={() => {
      createAndOpenNewProject(newProjectTitle);
      open = false;
    }}
    style="margin-top: 20px;"
  >
    Create Project
  </Button>
</Modal>
