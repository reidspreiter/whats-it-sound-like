import { createProcessorConfig } from "../../../../audio/shared";
import url from "./oscillatorTest.worklet.ts?worker&url";

export default createProcessorConfig("oscillator-test", url).addOutput("out").build();
