import { createProcessorConfig } from "../../../../audio/shared";
import url from "./audioOut.worklet.ts?worker&url";

export default createProcessorConfig("audio-out", url)
  .addInput("leftMono")
  .addInput("right")
  .addOutput("out", { channelCount: 2 })
  // Formula to convert amplitude to db:
  // :  20 * log10(amplitude)
  // Set displayBase to -10 for log10
  // Set multiplier to 40 instead of 20 and square in the process loop to create a larger exponential update curve
  .addParam("level", {
    automationRate: "k-rate",
    defaultValue: 1,
    displayBase: -10,
    displayMultiplier: 40,
    max: 2,
    min: 0,
  })
  .build();
