import {
  getKey,
  type AlgorithmStep,
  type CellKey,
  type PathfindingAlgorithm,
} from "$lib/components/PathRenderer.svelte";
import { equal, type Point } from "$lib/point";
import { SvelteSet } from "svelte/reactivity";

type Cell = Point & {
  visited: boolean;
  parent: Cell | null;
};

const dfs: PathfindingAlgorithm = function* (
  start: Point,
  end: Point,
  width: number,
  height: number,
  walls: SvelteSet<CellKey>
): Generator<AlgorithmStep, void, void> {
  const stack: Cell[] = [];
  const visited = new SvelteSet<CellKey>();
  const frontier = new SvelteSet<CellKey>();

  const startCell: Cell = {
    visited: true,
    parent: null,
    ...start,
  };

  stack.push(startCell);

  while (stack.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const cell = stack.pop()!;

    if (equal(cell, end)) {
      yield {
        path: reconstructPath(cell),
        visited,
        frontier,
      };

      return;
    }

    const cellKey = getKey(cell);
    frontier.delete(cellKey);

    if (visited.has(cellKey)) {
      continue;
    }

    visited.add(cellKey);

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
        walls.has(neighbourKey)
      ) {
        continue;
      }

      const neighbourCell: Cell = {
        x,
        y,
        parent: cell,
        visited: visited.has(neighbourKey),
      };

      if (!neighbourCell.visited) {
        yield {
          path: reconstructPath(neighbourCell),
          visited,
          frontier,
        };
      }

      frontier.add(neighbourKey);
      stack.push(neighbourCell);
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

export { dfs };
