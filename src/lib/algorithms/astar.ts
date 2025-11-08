import {
  getKey,
  type PathfindingAlgorithm,
  type CellKey,
  type AlgorithmStep,
} from "$lib/components/PathRenderer.svelte";
import { MinPriorityQueue } from "$lib/MinPriorityQueue";
import { equal, magnitude, subtract, type Point } from "$lib/point";
import { SvelteSet } from "svelte/reactivity";

type Heuristic = (start: Point, end: Point) => number;

const astar: PathfindingAlgorithm = function* (
  start: Point,
  end: Point,
  width: number,
  height: number,
  walls: SvelteSet<CellKey>
): Generator<AlgorithmStep, void, void> {
  const openSet = new MinPriorityQueue<Point>();
  const previousMap = new Map<CellKey, Point>();
  const visited = new SvelteSet<CellKey>();
  const gScores = new Map<CellKey, number>();

  const startHScore = euclideanDistance(start, end);
  const startKey = getKey(start);

  openSet.insert(start, 0 + startHScore, startKey);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const key = getKey(x, y);

      gScores.set(key, Infinity);
    }
  }

  gScores.set(startKey, 0);

  while (!openSet.isEmpty()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const current = openSet.extractMin()!.value;

    if (equal(current, end)) {
      yield {
        path: reconstructPath(previousMap, current),
        visited,
        frontier: new SvelteSet(openSet.data.map((node) => getKey(node.value))),
      };
      return;
    }

    const currentKey = getKey(current);
    openSet.delete(currentKey);
    visited.add(currentKey);

    const neighbours: Point[] = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbour of neighbours) {
      const neighbourKey = getKey(neighbour);

      if (
        neighbour.x < 0 ||
        neighbour.y < 0 ||
        neighbour.x >= width ||
        neighbour.y >= height ||
        walls.has(neighbourKey)
      ) {
        continue;
      }

      const currentG = gScores.get(currentKey) as number;
      const tentativeGScore = currentG + 1;
      if (tentativeGScore < (gScores.get(neighbourKey) as number)) {
        const fScore = tentativeGScore + euclideanDistance(neighbour, end);

        previousMap.set(neighbourKey, current);
        gScores.set(neighbourKey, tentativeGScore);

        if (!openSet.has(neighbourKey)) {
          openSet.insert(neighbour, fScore, neighbourKey);
        }

        yield {
          path: reconstructPath(previousMap, neighbour),
          visited,
          frontier: new SvelteSet(
            openSet.data.map((node) => getKey(node.value))
          ),
        };
      }
    }
  }

  yield {
    path: [start],
    visited,
    frontier: new SvelteSet(openSet.data.map((node) => getKey(node.value))),
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

const euclideanDistance: Heuristic = (start, end) =>
  magnitude(subtract(end, start));

export { astar };
