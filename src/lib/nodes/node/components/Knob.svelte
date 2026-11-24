<script module lang="ts">
  export const MAX_KNOB_ANGLE = 120;
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { onMount } from "svelte";

  import { preferences } from "../../../state";
  import { clamp } from "../../../util";

  export interface KnobProps {
    defaultValue?: number;
    indicatorProps?: HTMLAttributes<HTMLSpanElement>;
    knobProps?: HTMLAttributes<HTMLDivElement>;
    knobSize?: number;
    label: string;
    max: number;
    min: number;
    sensitivity?: number;
    step?: number;
    //unit?: string;
    value: number;
  }

  let {
    defaultValue,
    indicatorProps,
    knobProps,
    knobSize = 40,
    label,
    max,
    min,
    sensitivity = 1,
    step,
    value = $bindable(),
  }: KnobProps = $props();

  let percent = $state(0.5);
  const rawSensitivity = $derived(sensitivity / 200);

  let ptrLockDoubleClickTimeoutRef: null | number = null;
  let knobRef: HTMLDivElement;

  const setPercent = (p: number) => {
    const newValue = min + (max - min) * p;
    const newValueStepped =
      step === undefined || step === 0 ? newValue : Math.round(newValue / step) * step;
    percent = p;
    value = newValueStepped;
  };

  const setValue = (v: number) => {
    v = clamp(v, min, max);
    const newPercent = (v - min) / (max - min);
    percent = newPercent;
    value = v;
  };

  onMount(() => {
    setValue(value);
  });

  const onDrag = (e: PointerEvent) => {
    if (preferences.knobRotationStyle === "absolute-rotary") {
      const rect = knobRef.getBoundingClientRect();
      const knobCenterX = rect.width / 2 + rect.left;
      const knobCenterY = rect.height / 2 + rect.top;
      const angleFromVertical =
        Math.atan2(-e.clientX + knobCenterX, -e.clientY + knobCenterY) * (180 / Math.PI);
      const newPercent =
        (clamp(-angleFromVertical, -MAX_KNOB_ANGLE, MAX_KNOB_ANGLE) + MAX_KNOB_ANGLE) /
        (MAX_KNOB_ANGLE * 2);

      setPercent(newPercent);
    } else {
      const deltaY = -e.movementY;
      const _sensitivity = e.ctrlKey ? rawSensitivity / 7 : rawSensitivity;
      const newPercent = clamp(deltaY * _sensitivity + percent, 0, 1);

      setPercent(newPercent);
    }
  };

  const startDragging = (e: PointerEvent) => {
    knobRef.onpointermove = onDrag;

    if (preferences.knobRotationStyle === "linear-ptr-lock") {
      const promise = knobRef.requestPointerLock();

      if (promise) {
        promise.then();
      }
    } else {
      knobRef.setPointerCapture(e.pointerId);
    }
  };

  const stopDragging = (e: PointerEvent) => {
    knobRef.onpointermove = null;
    if (preferences.knobRotationStyle === "linear-ptr-lock") {
      document.exitPointerLock();
    } else {
      knobRef.releasePointerCapture(e.pointerId);
    }
  };

  const handleDoubleClick = () => {
    if (defaultValue !== undefined) {
      setValue(defaultValue);
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    // Ignore right click for context menu
    if (e.button === 2) {
      return;
    }

    // Double click does not work with pointer lock mode so we need to track it ourselves
    if (preferences.knobRotationStyle === "linear-ptr-lock" && defaultValue !== undefined) {
      if (ptrLockDoubleClickTimeoutRef !== null) {
        handleDoubleClick();
        clearTimeout(ptrLockDoubleClickTimeoutRef);
        ptrLockDoubleClickTimeoutRef = null;
      } else {
        ptrLockDoubleClickTimeoutRef = setTimeout(() => {
          ptrLockDoubleClickTimeoutRef = null;
        }, 300);
      }
    }

    startDragging(e);
    e.preventDefault();
  };
</script>

<div class="knob-wrapper" style:--knob-size="{knobSize}px">
  <div
    bind:this={knobRef}
    class="knob nodrag"
    {...knobProps}
    onpointerdown={handlePointerDown}
    onpointerup={stopDragging}
    ondblclick={handleDoubleClick}
    style:--knob-rotation="{240 * percent - 120}deg"
  >
    <span class="knob-indicator" {...indicatorProps}></span>
  </div>
  <p>{label}</p>
</div>

<style>
  .knob-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2px;
  }

  .knob {
    width: var(--knob-size);
    height: var(--knob-size);
    border-radius: 50%;
    background: var(--color-bg-surface);
    box-shadow: 
      /* Reflective border on edges for bevelled effect */
      inset -1px 0 1px 1px rgba(100, 100, 100, 0.6),
      /* Soft inner shadow from border edges */ inset 0 0 8px 8px rgba(100, 100, 100, 0.1),
      /* Outer shadow */ -6px 8px 16px rgba(0, 0, 0, 0.25);
    position: relative;
  }

  .knob-indicator {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 47%;
    width: 6%;
    height: 24%;
    border-radius: 10%;
    transform: rotate(var(--knob-rotation));
    transform-origin: 50% calc(var(--knob-size) / 2);
    background: var(--color-highlight-blue);
  }
</style>
