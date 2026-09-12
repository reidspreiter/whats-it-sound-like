<script lang="ts" module>
  interface Selections {
    edgeIds: string[];
    nodeIds: string[];
  }

  const selections = $state<Selections>({ edgeIds: [], nodeIds: [] });

  export const getSelectedNodeIds = (): Readonly<string[]> => {
    return selections.nodeIds;
  };

  export const getSelectedEdgeIds = (): Readonly<string[]> => {
    return selections.edgeIds;
  };
</script>

<script lang="ts">
  import { useOnSelectionChange } from "@xyflow/svelte";

  import { addKeybindHint, keybinds, removeKeybindHint } from "../../state";

  // This selection monitor stores global selection state
  // to reduce the amount of selection change listeners and
  // avoid O(N) selected lookup operations, where N is the
  // total number of edges, not just the edges selected.
  //
  // Probably overkill, but better than having a separate selection
  // listener in each edge and may allow more flexibility with
  // selections down the line.
  useOnSelectionChange(({ edges, nodes }) => {
    if (nodes.length > 0 || edges.length > 0) {
      const nodesString =
        nodes.length > 0 ? ` ${nodes.length} node${nodes.length > 1 ? "s" : ""}` : "";
      const edgesString =
        edges.length > 0 ? ` ${edges.length} edge${edges.length > 1 ? "s" : ""}` : "";

      addKeybindHint("delete-nodes-edges", {
        description: `Delete${nodesString}${nodesString.length > 0 && edgesString.length > 0 ? "," : ""}${edgesString}`,
        keybind: keybinds.deleteSelected,
      });
    } else {
      removeKeybindHint("delete-nodes-edges");
    }

    selections.nodeIds = nodes.map((node) => node.id);
    selections.edgeIds = edges.map((edge) => edge.id);
  });
</script>
