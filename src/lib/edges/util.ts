import { JACK_DIAMETER_PX } from "../nodes/components/Jack.svelte";

export const CABLE_NAME = "cable";

// Svelte Flow handles must have a position.
// The Jack component sets its position to Position.Top. There isn't a more ideal position to get the inner-node body look we are after.
// Position.Top forces the source and target edge markers to be centered on the handle's top, not the middle.
// Move cable markers down by half the jack diameter so they are perfectly centered.
export const CABLE_MARKER_Y_OFFSET = JACK_DIAMETER_PX / 2;

export const getQuadraticCurvePath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  tension: number,
  yOffset: number = CABLE_MARKER_Y_OFFSET,
) => {
  const _sourceY = sourceY + yOffset;
  const _targetY = targetY + yOffset;

  const midX = (sourceX + targetX) / 2;
  const midY = (_sourceY + _targetY) / 2;

  const vertical = Math.max(Math.abs(_targetY - _sourceY), Math.abs(sourceX - targetX) / 4);

  const gravity = 2;
  const controlX = midX;
  const controlY = midY + vertical * gravity * (1 - tension);

  return `M ${sourceX} ${_sourceY} Q ${controlX} ${controlY} ${targetX} ${_targetY}`;
};
