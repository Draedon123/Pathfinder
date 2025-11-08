import {
  getKey,
  type AlgorithmStep,
  type CellKey,
  type PathfindingAlgorithm,
} from "$lib/components/PathRenderer.svelte";
import { MinPriorityQueue } from "$lib/MinPriorityQueue";
import { SvelteSet } from "svelte/reactivity";

type Cell = {
  x: number;
  y: number;
  isWall: boolean;
};

const dijkstra: PathfindingAlgorithm = function* (
  start: Pair<number>,
  end: Pair<number>,
  width: number,
  height: number,
  walls: SvelteSet<CellKey>
): Generator<AlgorithmStep, void, void> {
  const queue = new MinPriorityQueue<Cell>();
  const distanceMap = new Map<CellKey, number>();
  const previousMap = new Map<CellKey, Pair<number>>();
  const visited = new SvelteSet<CellKey>();
  const tiles = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      isWall: walls.has(getKey(x, y)),
    }))
  ).flat();

  for (const tile of tiles) {
    const key = getKey(tile.x, tile.y);

    distanceMap.set(key, Infinity);
  }

  const startKey = getKey(start[0], start[1]);
  distanceMap.set(startKey, 0);
  queue.insert(tiles[start[0] + width * start[1]], 0, startKey);

  while (!queue.isEmpty()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const min = queue.extractMin()!;
    const current = min.value;
    const currentKey = getKey(current.x, current.y);

    if (visited.has(currentKey)) {
      continue;
    }

    visited.add(currentKey);

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
        previousMap.set(neighbourKey, [current.x, current.y]);

        if (!queue.has(neighbourKey)) {
          queue.insert(neighbour, distance, neighbourKey);
        } else {
          queue.decreasePriority(neighbourKey, distance);
        }

        yield {
          path: reconstructPath(previousMap, [neighbour.x, neighbour.y]),
          visited,
          frontier: new SvelteSet(
            queue.data.map((node) => getKey(node.value.x, node.value.y))
          ),
        };
      }
    }
  }

  yield {
    path: reconstructPath(previousMap, end),
    visited,
    frontier: new SvelteSet(
      queue.data.map((node) => getKey(node.value.x, node.value.y))
    ),
  };
};

function reconstructPath(
  previousMap: Map<CellKey, Pair<number>>,
  current: Pair<number>
): Pair<number>[] {
  const path: Pair<number>[] = [current];
  while (previousMap.has(getKey(current[0], current[1]))) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    current = previousMap.get(getKey(current[0], current[1]))!;
    path.unshift(current);
  }

  return path;
}

export { dijkstra };
