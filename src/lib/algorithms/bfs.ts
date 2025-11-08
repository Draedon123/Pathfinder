import {
  getKey,
  type AlgorithmStep,
  type CellKey,
  type PathfindingAlgorithm,
} from "$lib/components/PathRenderer.svelte";
import { equal, type Point } from "$lib/point";
import { Queue } from "$lib/Queue";
import { SvelteSet } from "svelte/reactivity";

type Cell = Point & {
  visited: boolean;
  parent: Cell | null;
};

const bfs: PathfindingAlgorithm = function* (
  start: Point,
  end: Point,
  width: number,
  height: number,
  walls: SvelteSet<CellKey>
): Generator<AlgorithmStep, void, void> {
  const queue = new Queue<Cell>();
  const visited = new SvelteSet<CellKey>();
  const frontier = new SvelteSet<CellKey>();

  const startCell: Cell = {
    visited: true,
    parent: null,
    ...start,
  };

  queue.enqueue(startCell);
  visited.add(getKey(start));

  while (!queue.empty) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const cell = queue.dequeue()!;

    if (equal(cell, end)) {
      yield {
        path: reconstructPath(cell),
        visited,
        frontier,
      };

      return;
    }

    frontier.delete(getKey(cell));

    const neighbours = [
      [cell.x + 1, cell.y],
      [cell.x - 1, cell.y],
      [cell.x, cell.y + 1],
      [cell.x, cell.y - 1],
    ];

    for (const [x, y] of neighbours) {
      const neighbourKey = getKey(x, y);
      if (
        x < 0 ||
        y < 0 ||
        x >= width ||
        y >= height ||
        visited.has(neighbourKey) ||
        walls.has(neighbourKey)
      ) {
        continue;
      }

      visited.add(neighbourKey);
      const neighbourCell: Cell = {
        x,
        y,
        parent: cell,
        visited: true,
      };
      yield {
        path: reconstructPath(neighbourCell),
        visited,
        frontier,
      };
      frontier.add(neighbourKey);

      queue.enqueue(neighbourCell);
    }
  }

  yield {
    path: [],
    visited,
    frontier,
  };
};

function reconstructPath(cell: Cell): Point[] {
  const path: Point[] = [];

  let currentCell: Cell | null = cell;
  while (currentCell !== null) {
    path.unshift(currentCell);
    currentCell = currentCell.parent;
  }

  return path;
}

export { bfs };
