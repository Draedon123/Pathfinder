import {
  getKey,
  type PathfindingAlgorithm,
  type CellKey,
} from "$lib/components/PathRenderer.svelte";
import { MinPriorityQueue } from "$lib/MinPriorityQueue";
import type { SvelteSet } from "svelte/reactivity";

type Heuristic = (start: Pair<number>, end: Pair<number>) => number;

const astar: PathfindingAlgorithm = function* (
  start: Pair<number>,
  end: Pair<number>,
  width: number,
  height: number,
  walls: SvelteSet<CellKey>
): Generator<Pair<number>[], void, void> {
  const openSet = new MinPriorityQueue<Pair<number>>();
  const previousMap = new Map<CellKey, Pair<number>>();
  const gScores = new Map<CellKey, number>();
  const fScores = new Map<CellKey, number>();

  const startHScore = euclideanDistance(start, end);
  const startKey = getKey(start[0], start[1]);

  openSet.insert(start, 0 + startHScore, startKey);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const key = getKey(x, y);

      gScores.set(key, Infinity);
      fScores.set(key, Infinity);
    }
  }

  gScores.set(startKey, 0);
  fScores.set(startKey, startHScore);

  while (!openSet.isEmpty()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const current = openSet.extractMin()!.value;

    if (current[0] === end[0] && current[1] === end[1]) {
      yield reconstructPath(previousMap, current);
      return;
    }

    const currentKey = getKey(current[0], current[1]);
    openSet.delete(currentKey);

    const neighbours: Pair<number>[] = [
      [current[0] + 1, current[1]],
      [current[0] - 1, current[1]],
      [current[0], current[1] + 1],
      [current[0], current[1] - 1],
    ];

    for (const neighbour of neighbours) {
      const [x, y] = neighbour;
      const neighbourKey = getKey(x, y);

      if (
        x < 0 ||
        y < 0 ||
        x >= width ||
        y >= height ||
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
        fScores.set(neighbourKey, fScore);

        if (!openSet.has(neighbourKey)) {
          openSet.insert(neighbour, fScore, neighbourKey);
        }

        yield reconstructPath(previousMap, neighbour);
      }
    }
  }

  yield [start];
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

const euclideanDistance: Heuristic = (start, end) =>
  Math.hypot(end[0] - start[0], end[1] - start[1]);

export { astar };
