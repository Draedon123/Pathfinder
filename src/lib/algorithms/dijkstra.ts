import { getKey, type CellKey } from "$lib/components/PathRenderer.svelte";
import { MinPriorityQueue } from "$lib/MinPriorityQueue";
import type { SvelteSet } from "svelte/reactivity";

type Cell = {
  x: number;
  y: number;
  isWall: boolean;
};

const dijkstra = (
  start: [number, number],
  end: [number, number],
  width: number,
  height: number,
  walls: SvelteSet<CellKey>
): [number, number][] => {
  const path: [number, number][] = [];
  const queue = new MinPriorityQueue<Cell>();
  const distanceMap = new Map<CellKey, number>();
  const previousMap = new Map<CellKey, CellKey | null>();
  const visisted = new Set<CellKey>();
  const tiles = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      isWall: walls.has(getKey(x, y)),
    }))
  ).flat();

  for (const tile of tiles) {
    const distance = tile.x === start[0] && tile.y === start[1] ? 0 : Infinity;
    const key = getKey(tile.x, tile.y);

    distanceMap.set(key, distance);
    previousMap.set(key, null);
    queue.insert(tile, distance, key);
  }

  while (!queue.isEmpty()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const min = queue.extractMin()!;
    const current = min.value;
    const currentKey = getKey(current.x, current.y);

    if (visisted.has(currentKey)) {
      continue;
    }

    visisted.add(currentKey);

    if (current.x === end[0] && current.y === end[1]) {
      break;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentDistance = distanceMap.get(currentKey)!;
    const neighbours = [
      [current.x + 1, current.y],
      [current.x - 1, current.y],
      [current.x, current.y + 1],
      [current.x, current.y - 1],
    ];

    for (const [x, y] of neighbours) {
      const neighbour = tiles[x + y * width];

      if (
        neighbour === undefined ||
        neighbour.isWall ||
        x < 0 ||
        y < 0 ||
        x >= width ||
        y >= height
      ) {
        continue;
      }

      const neighbourKey = getKey(neighbour.x, neighbour.y);
      const distance = currentDistance + 1;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (distance < distanceMap.get(neighbourKey)!) {
        distanceMap.set(neighbourKey, distance);
        previousMap.set(neighbourKey, currentKey);
        queue.decreasePriority(neighbourKey, distance);
      }
    }
  }

  let current = getKey(
    tiles[end[0] + width * end[1]].x,
    tiles[end[0] + width * end[1]].y
  );

  while (current) {
    const [x, y] = current.split(",").map((value) => parseInt(value));
    path.unshift([x, y]);
    const previous = previousMap.get(current);

    if (!previous) {
      break;
    }

    current = previous;
  }

  return path;
};

export { dijkstra };
