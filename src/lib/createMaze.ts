import { SvelteSet } from "svelte/reactivity";
import { getKey, type CellKey } from "./components/PathRenderer.svelte";
import { OrderedSet } from "./OrderedSet";

type Cell = {
  x: number;
  y: number;
  isWall: boolean;
};

function createMaze(
  width: number,
  height: number,
  start: [number, number]
): SvelteSet<CellKey> {
  const cells: Cell[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({
        x,
        y,
        isWall: true,
      });
    }
  }

  const startingCell = getCell(cells, width, start[0], start[1]);
  const startingCellNeighbours = getNeighbours(
    startingCell,
    width,
    height,
    cells,
    2
  );
  const frontier = new OrderedSet<Cell>();
  const inMaze = new Set<CellKey>();

  startingCell.isWall = false;

  inMaze.add(getKey(startingCell.x, startingCell.y));

  for (const neighbour of startingCellNeighbours) {
    frontier.add(neighbour.cell);
  }

  while (frontier.size > 0) {
    const frontierTile = frontier.random();
    const frontierNeighbours = getNeighbours(
      frontierTile,
      width,
      height,
      cells,
      2
    );

    const neighboursInMaze = frontierNeighbours.filter((neighbour) =>
      inMaze.has(getKey(neighbour.cell.x, neighbour.cell.y))
    );

    if (neighboursInMaze.length === 0) {
      frontier.remove(frontierTile);
      continue;
    }

    const target =
      neighboursInMaze[Math.floor(Math.random() * neighboursInMaze.length)];

    const wall = getCell(
      cells,
      width,
      frontierTile.x + target.direction[0],
      frontierTile.y + target.direction[1]
    );

    inMaze.add(getKey(frontierTile.x, frontierTile.y));
    wall.isWall = false;
    frontierTile.isWall = false;

    frontier.remove(frontierTile);

    for (const neighbour of frontierNeighbours) {
      if (!inMaze.has(getKey(neighbour.cell.x, neighbour.cell.y))) {
        frontier.add(neighbour.cell);
      }
    }
  }

  return new SvelteSet(
    cells.filter((cell) => cell.isWall).map((cell) => getKey(cell.x, cell.y))
  );
}

function getNeighbours(
  cell: Cell,
  width: number,
  height: number,
  cells: Cell[],
  distanceMultiplier: number = 1
): { cell: Cell; direction: [number, number] }[] {
  const directions: [number, number][] = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];

  return directions
    .map((direction) => {
      return {
        cell: getCell(
          cells,
          width,
          cell.x + direction[0] * distanceMultiplier,
          cell.y + direction[1] * distanceMultiplier
        ),
        direction,
      };
    })
    .filter(
      (neighbour) =>
        neighbour.cell &&
        neighbour.cell.x >= 0 &&
        neighbour.cell.y >= 0 &&
        neighbour.cell.x < width &&
        neighbour.cell.y < height
    );
}

function getCell(cells: Cell[], width: number, x: number, y: number): Cell {
  if (x < 0 || y < 0) {
    return undefined as unknown as Cell;
  }

  return cells[x + width * y];
}

export { createMaze };
