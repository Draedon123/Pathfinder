import {
  getKey,
  type AlgorithmStep,
  type CellKey,
  type PathfindingAlgorithm,
} from "$lib/components/PathRenderer.svelte";
import { Queue } from "$lib/Queue";
import { SvelteSet } from "svelte/reactivity";

type Cell = {
  x: number;
  y: number;
  visited: boolean;
  parent: Cell | null;
};

const bfs: PathfindingAlgorithm = function* (
  start: Pair<number>,
  end: Pair<number>,
  width: number,
  height: number,
  walls: SvelteSet<CellKey>
): Generator<AlgorithmStep, void, void> {
  const queue = new Queue<Cell>();
  const visited = new SvelteSet<CellKey>();
  const frontier = new SvelteSet<CellKey>();

  const startCell: Cell = {
    x: start[0],
    y: start[1],
    visited: true,
    parent: null,
  };

  queue.enqueue(startCell);
  visited.add(getKey(start[0], start[1]));

  while (!queue.empty) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const cell = queue.dequeue()!;

    if (cell.x === end[0] && cell.y === end[1]) {
      yield {
        path: reconstructPath(cell),
        visited,
        frontier,
      };

      return;
    }

    frontier.delete(getKey(cell.x, cell.y));

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

function reconstructPath(cell: Cell): [number, number][] {
  const path: [number, number][] = [];

  let currentCell: Cell | null = cell;
  while (currentCell !== null) {
    path.unshift([currentCell.x, currentCell.y]);
    currentCell = currentCell.parent;
  }

  return path;
}

export { bfs };
