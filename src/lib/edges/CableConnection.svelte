<script lang="ts">
  import { useConnection } from "@xyflow/svelte";

  import { preferences } from "../state";
  import CableMarker from "./CableMarker.svelte";
  import { getQuadraticCurvePath } from "./util";

  const connection = useConnection();

  let cablePath = $derived.by(() => {
    if (connection.current.inProgress) {
      const { from, to } = connection.current;
      return getQuadraticCurvePath(from.x, from.y, to.x, to.y, preferences.cableTension, 0);
    }
    return null;
  });
</script>

{#if connection.current.inProgress}
  <path
    stroke="var(--color-highlight-blue)"
    stroke-opacity="1"
    stroke-width="4"
    fill="none"
    d={cablePath}
  />
  <CableMarker
    centerX={connection.current.from.x}
    centerY={connection.current.from.y}
    yOffset={0}
    strokeColor="var(--color-highlight-blue)"
  />
  <CableMarker
    centerX={connection.current.to.x}
    centerY={connection.current.to.y}
    yOffset={0}
    strokeColor="var(--color-highlight-blue)"
  />
{/if}
