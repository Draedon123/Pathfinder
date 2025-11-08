import {
  getKey,
  type AlgorithmStep,
  type CellKey,
  type PathfindingAlgorithm,
} from "$lib/components/PathRenderer.svelte";
import { MinPriorityQueue } from "$lib/MinPriorityQueue";
import { equal, type Point } from "$lib/point";
import { SvelteSet } from "svelte/reactivity";

type Cell = Point & {
  isWall: boolean;
};

const dijkstra: PathfindingAlgorithm = function* (
  start: Point,
  end: Point,
  width: number,
  height: number,
  walls: SvelteSet<CellKey>
): Generator<AlgorithmStep, void, void> {
  const queue = new MinPriorityQueue<Cell>();
  const distanceMap = new Map<CellKey, number>();
  const previousMap = new Map<CellKey, Point>();
  const visited = new SvelteSet<CellKey>();
  const tiles = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      isWall: walls.has(getKey(x, y)),
    }))
  ).flat();

  for (const tile of tiles) {
    const key = getKey(tile);

    distanceMap.set(key, Infinity);
  }

  const startKey = getKey(start);
  distanceMap.set(startKey, 0);
  queue.insert(tiles[start.x + width * start.y], 0, startKey);

  while (!queue.isEmpty()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const min = queue.extractMin()!;
    const current = min.value;
    const currentKey = getKey(current);

    if (visited.has(currentKey)) {
      continue;
    }

    visited.add(currentKey);

    if (equal(current, end)) {
      break;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentDistance = distanceMap.get(currentKey)!;
    const neighbours: Point[] = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const { x, y } of neighbours) {
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

      const neighbourKey = getKey(neighbour);
      const distance = currentDistance + 1;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (distance < distanceMap.get(neighbourKey)!) {
        distanceMap.set(neighbourKey, distance);
        previousMap.set(neighbourKey, current);

        if (!queue.has(neighbourKey)) {
          queue.insert(neighbour, distance, neighbourKey);
        } else {
          queue.decreasePriority(neighbourKey, distance);
        }

        yield {
          path: reconstructPath(previousMap, neighbour),
          visited,
          frontier: new SvelteSet(queue.data.map((node) => getKey(node.value))),
        };
      }
    }
  }

  yield {
    path: reconstructPath(previousMap, end),
    visited,
    frontier: new SvelteSet(queue.data.map((node) => getKey(node.value))),
  };
};

function reconstructPath(
  previousMap: Map<CellKey, Point>,
  current: Point
): Point[] {
  const path: Point[] = [current];
  while (previousMap.has(getKey(current))) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    current = previousMap.get(getKey(current))!;
    path.unshift(current);
  }

  return path;
}

export { dijkstra };
