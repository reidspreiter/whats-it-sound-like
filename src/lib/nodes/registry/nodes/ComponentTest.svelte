<script>
  import { Button } from "../../../components";
  import { sendNotification } from "../../../state";
  import { Jack, NodeSurface, Switch, SwitchHousing } from "../../components";
</script>

<NodeSurface>
  <SwitchHousing>
    <Switch>X</Switch>
    <Switch>O</Switch>
  </SwitchHousing>

  <Jack name="in" type="input" />
  <Jack name="out" type="output" />

  <div style="display: flex; flex-direction: column;">
    <Button onclick={() => sendNotification("Test info notification")}>Info notification</Button>
    <Button
      onclick={() =>
        sendNotification(
          "Test error notification. Oh my goodness something went wrong. I wonder what?",
          "error",
        )}>Error notification</Button
    >
  </div>
</NodeSurface>
