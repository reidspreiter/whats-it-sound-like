import {
  createWISLAudioProcessor,
  registerWISLProcessor,
  type WISLProcessArgs,
} from "../../../../audio/process";
import CONFIG from "./oscillatorTest.config";

class OscillatorTest extends createWISLAudioProcessor(CONFIG) {
  private phase = 0;

  wislProcess(args: WISLProcessArgs<typeof CONFIG>): void {
    const output = args.outputs.out[0];
    const frequency = 440;
    const increment = frequency / sampleRate;

    for (let i = 0; i < output.length; i++) {
      // This sin approximation is apparently faster than Math.sin but this
      // has not been verified in our environment yet
      const x = this.phase * 2.0 - 1.0;
      output[i] = 4.0 * x * (1.0 - Math.abs(x));

      this.phase += increment;
      if (this.phase >= 1.0) {
        this.phase -= 1.0;
      }
    }
  }
}

registerWISLProcessor(OscillatorTest);
