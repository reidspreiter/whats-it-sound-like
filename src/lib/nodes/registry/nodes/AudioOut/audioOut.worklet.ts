import {
  createWISLAudioProcessor,
  isConnected,
  registerWISLProcessor,
  type WISLProcessArgs,
} from "../../../../audio/process";
import { clamp } from "../../../../util";
import CONFIG from "./audioOut.config";

class AudioOut extends createWISLAudioProcessor(CONFIG) {
  wislProcess(args: WISLProcessArgs<typeof CONFIG>): void {
    const connectedL = isConnected(args.inputs.leftMono);
    const connectedR = isConnected(args.inputs.right);

    if (!(connectedL || connectedR)) {
      return;
    }

    const inputL = args.inputs.leftMono[0];
    const inputR = args.inputs.right[0];
    const outputL = args.outputs.out[0];
    const outputR = args.outputs.out[1];
    const amplitude = Math.pow(args.params.level[0], 2);

    for (let i = 0; i < outputL.length; i++) {
      if (connectedL) {
        const val = clamp(inputL[i] * amplitude, -1, 1);
        outputL[i] = val;

        if (!connectedR) {
          outputR[i] = val;
        }
      }

      if (connectedR) {
        outputR[i] = clamp(inputR[i] * amplitude, -1, 1);
      }
    }
  }
}

registerWISLProcessor(AudioOut);
