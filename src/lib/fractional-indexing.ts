/**
 * Fractional indexing helper to allow arbitrary re-ordering
 * in lists and Kanban columns without updating all sibling rows.
 */

export const DEFAULT_POSITION_GAP = 1000.0;

export function calculatePosition(
  prevPosition: number | null | undefined,
  nextPosition: number | null | undefined
): number {
  const hasPrev = prevPosition !== null && prevPosition !== undefined && !Number.isNaN(prevPosition);
  const hasNext = nextPosition !== null && nextPosition !== undefined && !Number.isNaN(nextPosition);

  if (!hasPrev && !hasNext) {
    return DEFAULT_POSITION_GAP;
  }

  if (!hasPrev && hasNext) {
    return (nextPosition as number) / 2;
  }

  if (hasPrev && !hasNext) {
    return (prevPosition as number) + DEFAULT_POSITION_GAP;
  }

  // Both exist
  const prev = prevPosition as number;
  const next = nextPosition as number;

  if (prev === next) {
    return prev + DEFAULT_POSITION_GAP / 2;
  }

  return (prev + next) / 2;
}

/**
 * Given a sorted array of items with a .position property,
 * computes the new position for an item placed at targetIndex.
 */
export function getPositionAtIndex<T extends { position: number }>(
  items: T[],
  targetIndex: number
): number {
  if (items.length === 0) {
    return DEFAULT_POSITION_GAP;
  }

  if (targetIndex <= 0) {
    const first = items[0];
    return first ? calculatePosition(null, first.position) : DEFAULT_POSITION_GAP;
  }

  if (targetIndex >= items.length) {
    const last = items[items.length - 1];
    return last ? calculatePosition(last.position, null) : DEFAULT_POSITION_GAP;
  }

  const prevItem = items[targetIndex - 1];
  const nextItem = items[targetIndex];

  if (!prevItem || !nextItem) {
    return DEFAULT_POSITION_GAP;
  }

  return calculatePosition(prevItem.position, nextItem.position);
}
