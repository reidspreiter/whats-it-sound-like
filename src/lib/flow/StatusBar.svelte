<script lang="ts">
  import { useEdges, useNodes } from "@xyflow/svelte";

  import { Icon } from "../components";
  import TextWithRename from "../components/TextWithRename.svelte";
  import { activeProject, renameProject } from "../state";

  const nodes = useNodes();
  const edges = useEdges();
</script>

<div class="status-bar">
  <TextWithRename
    text={activeProject.title}
    textProps={{
      style: "white-space: nowrap; max-width: 20ch; overflow: hidden; text-overflow: ellipsis; ",
    }}
    onRename={async (newName) => await renameProject(activeProject.id ?? "", newName)}
  />
  <p>|</p>
  <p style="display: flex;"><Icon name="speaker-hifi" />:{nodes.current.length}</p>
  <p style="display: flex;"><Icon name="path" />:{edges.current.length}</p>
</div>

<style>
  .status-bar {
    font-size: 10px;
    padding: 4px;
    display: flex;
    gap: 10px;
    align-items: center;
    white-space: nowrap;
  }
</style>
