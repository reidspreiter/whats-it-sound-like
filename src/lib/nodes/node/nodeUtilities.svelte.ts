import { useNodesData, useSvelteFlow } from "@xyflow/svelte";

import type { WISLAudioProcessorConfig } from "../../audio/shared";
import type { JackProps, JackType, KnobProps } from "./components";

import { getNodeRenderContext, type WISLNode, type WISLNodeConfig } from ".";
import { nodeRegistry } from "../registry";

const useAnimation = (animate: FrameRequestCallback) => {
  let frame: null | number = null;

  const stop = () => {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  };

  const start = () => {
    const _animate: FrameRequestCallback = (time) => {
      animate(time);
      frame = requestAnimationFrame(_animate);
    };
    frame = requestAnimationFrame(_animate);
  };

  $effect(() => {
    start();

    return stop;
  });
};

type GetParams<TNode extends WISLNode> =
  TNode extends WISLNode<string, infer TProcessorConfig extends WISLAudioProcessorConfig>
    ? { [P in keyof TProcessorConfig["params"]]: number }
    : Record<string, unknown>;

interface WISLNodeUtilities<TNode extends WISLNode = WISLNode> {
  getJackProps: <
    TName extends (TNode extends WISLNode<
      string,
      infer TProcessorConfig extends WISLAudioProcessorConfig
    >
      ? keyof TProcessorConfig["inputs"] | keyof TProcessorConfig["outputs"]
      : never),
  >(
    name: TName,
  ) => JackProps;
  getKnobProps: <TName extends keyof GetParams<TNode>>(name: string & TName) => KnobProps;
  setParam: <TName extends keyof GetParams<TNode>>(
    name: string & TName,
    value: GetParams<TNode>[TName],
  ) => void;
  useAnimation: typeof useAnimation;
}

export function useWISLNode<TNode extends WISLNode = WISLNode>(
  getId: () => string,
): WISLNodeUtilities<TNode> {
  const id = $derived(getId());
  const context = getNodeRenderContext();

  // Default no-ops for error cases or visual render contexts that don't rely on complete functionality
  const utilities: WISLNodeUtilities<TNode> = {
    getJackProps: (name) => {
      return { name, type: "output" };
    },
    getKnobProps: (name) => {
      return { defaultValue: 0.5, label: name, max: 1, min: 0, value: 0.5 };
    },
    setParam: () => {},
    useAnimation,
  };

  if (context.visualOnly) {
    return utilities;
  }

  const { updateNodeData } = useSvelteFlow();
  const nodeData = useNodesData<TNode>(id);

  if (nodeData.current === null) {
    console.error(`Failed to get data for utilities for node '${id}'`);
    return utilities;
  }

  const data = $derived(nodeData.current.data);
  const type = nodeData.current.type;

  if (type === undefined) {
    console.error(`Failed to get data for utilities for undefined node type '${id}'`);
    return utilities;
  }

  const nodeConfig = nodeRegistry[type]?.config as unknown as
    undefined | WISLNodeConfig<string, WISLAudioProcessorConfig>;
  if (nodeConfig === undefined) {
    console.error(`Failed to get node config for type '${type}'`);
    return utilities;
  }

  utilities.getJackProps = (name) => {
    let type = "unknown";

    if (nodeConfig.processor !== undefined) {
      if (name in nodeConfig.processor.inputs) {
        type = "input";
      } else if (name in nodeConfig.processor.outputs) {
        type = "output";
      }
    }

    if (type === "unknown") {
      console.error(`Failed to determine jack type for ${type}.${name}`);
      type = "output";
    }

    return { name, type: type as JackType };
  };

  utilities.getKnobProps = (name) => {
    const param =
      nodeConfig.processor !== undefined && name in nodeConfig.processor.params
        ? nodeConfig.processor.params[name]
        : undefined;

    return {
      defaultValue: param?.defaultValue,
      label: name,
      max: param?.max ?? 1,
      min: param?.min ?? 0,
      step: param?.step,
      get value() {
        return data[name] as number;
      },
      set value(v) {
        if (param) {
          utilities.setParam(name, v as GetParams<TNode>[typeof name]);
        }
      },
    } satisfies KnobProps;
  };

  utilities.setParam = (key, value) => {
    if (nodeConfig.processor !== undefined && key in nodeConfig.processor.params) {
      data.processor?.setParamValue(key, value as number);
    }

    updateNodeData(id, { [key]: value });
  };

  return utilities;
}
