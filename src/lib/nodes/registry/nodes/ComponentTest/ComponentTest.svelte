<script lang="ts" module>
  import { Button } from "../../../../components";
  import { postError, postNotification } from "../../../../state";
  import { createNodeConfig, Jack, NodeSurface, Switch, SwitchHousing } from "../../../node";

  export const CONFIG = createNodeConfig("Component Test").build();
</script>

<NodeSurface>
  <SwitchHousing>
    <Switch>X</Switch>
    <Switch>O</Switch>
  </SwitchHousing>

  <Jack name="in" type="input" />
  <Jack name="out" type="output" />

  <div style="display: flex; flex-direction: column;">
    <Button onclick={() => postNotification("Test info notification")}>Info notification</Button>
    <Button
      onclick={() =>
        postError("Test error notification. Oh my goodness something went wrong. I wonder what?")}
      >Error notification</Button
    >
  </div>
</NodeSurface>
