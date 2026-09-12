<script lang="ts" module>
  export const CABLE_MARKER_RADIUS = 6;
</script>

<script lang="ts">
  import { CABLE_MARKER_Y_OFFSET } from "./util";

  interface EdgeMarkerProps {
    centerX: number;
    centerY: number;
    strokeColor: string;
    yOffset?: number;
  }

  let {
    centerX,
    centerY,
    strokeColor,
    yOffset = CABLE_MARKER_Y_OFFSET,
  }: EdgeMarkerProps = $props();
</script>

<circle
  cx={centerX}
  cy={centerY + yOffset}
  r={CABLE_MARKER_RADIUS}
  fill="var(--color-analog-well)"
  stroke={strokeColor}
  stroke-width="4"
/>
