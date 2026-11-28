import type { DisplayConfig } from "../../audio/shared";

const getDecimalLength = (n: number): number => {
  const parts = n.toString().split(".");
  return parts[1]?.length || 0;
};

export const getDisplayValueString = (
  value: number,
  step?: number,
  displayConfig?: DisplayConfig,
) => {
  const precision =
    step === 0 || step === undefined
      ? (displayConfig?.displayPrecision ?? 4)
      : getDecimalLength(step);
  const displayBase = displayConfig?.displayBase ?? 0;
  const displayMultiplier = displayConfig?.displayMultiplier ?? 1;
  const displayOffset = displayConfig?.displayOffset ?? 0;

  if (displayBase < 0) {
    value = Math.log(value) / Math.log(-displayBase);
  } else if (displayBase > 0) {
    value = Math.pow(displayBase, value);
  }

  value = value * displayMultiplier + displayOffset;

  if (value === Number.MIN_SAFE_INTEGER) {
    return "-Infinity";
  } else if (value === Number.MAX_SAFE_INTEGER) {
    return "Infinity";
  } else {
    return value.toFixed(precision);
  }
};

export const revertDisplayValue = (displayValue: number, displayConfig?: DisplayConfig) => {
  const displayBase = displayConfig?.displayBase ?? 0;
  const displayMultiplier = displayConfig?.displayMultiplier ?? 1;
  const displayOffset = displayConfig?.displayOffset ?? 0;

  let value = (displayValue - displayOffset) / displayMultiplier;

  if (displayBase < 0) {
    value = Math.pow(-displayBase, value);
  } else if (displayBase > 0) {
    value = Math.log(value) / Math.log(displayBase);
  }

  return value;
};
