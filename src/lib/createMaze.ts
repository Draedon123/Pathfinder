import { SvelteSet } from "svelte/reactivity";
import { getKey, type CellKey } from "./components/PathRenderer.svelte";
import { OrderedSet } from "./OrderedSet";
import { add, equal, scale, type Point } from "./point";
import { astarEuclidean } from "./algorithms/astar";

type Cell = Point & {
  isWall: boolean;
};

function createMaze(
  width: number,
  height: number,
  start: Point,
  end: Point
): SvelteSet<CellKey> {
  const cells: Cell[] = [];
  const originalWidth = width;
  const originalHeight = height;

  width = width % 2 === 0 ? width + 1 : width;
  height = height % 2 === 0 ? height + 1 : height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({
        x,
        y,
        isWall: true,
      });
    }
  }

  const startingCell = getCell(cells, width, start);
  const startingCellNeighbours = getNeighbours(
    startingCell,
    width,
    height,
    cells,
    2
  );
  const frontier = new OrderedSet<Cell>();
  const inMaze = new Set<CellKey>();
  const endCell = getCell(cells, width, end);
  const endCellNeighbours = getNeighbours(endCell, width, height, cells, 2);

  startingCell.isWall = false;
  endCell.isWall = false;

  inMaze.add(getKey(startingCell));

  for (const neighbour of [...startingCellNeighbours, ...endCellNeighbours]) {
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
      inMaze.has(getKey(neighbour.cell))
    );

    if (neighboursInMaze.length === 0) {
      frontier.remove(frontierTile);
      continue;
    }

    const target =
      neighboursInMaze[Math.floor(Math.random() * neighboursInMaze.length)];

    const wall = getCell(cells, width, add(frontierTile, target.direction));

    inMaze.add(getKey(frontierTile));
    wall.isWall = false;
    frontierTile.isWall = false;

    frontier.remove(frontierTile);

    for (const neighbour of frontierNeighbours) {
      if (!inMaze.has(getKey(neighbour.cell))) {
        frontier.add(neighbour.cell);
      }
    }
  }

  const walls = new SvelteSet(
    cells
      .filter(
        (cell) =>
          cell.isWall &&
          !equal(cell, end) &&
          cell.x < originalWidth &&
          cell.y < originalHeight
      )
      .map((cell) => getKey(cell))
  );

  // hack to ensure the maze is always solvable...
  // wouldn't need this if the width and height were guaranteed to be odd
  const generator = astarEuclidean(
    start,
    end,
    originalWidth,
    originalHeight,
    walls
  );

  let next = generator.next();
  let path: Point[] = [];
  while (!next.done) {
    path = next.value.path;
    next = generator.next();
  }

  if (path.length <= 1) {
    return createMaze(originalWidth, originalHeight, start, end);
  }

  return walls;
}

function getNeighbours(
  cell: Cell,
  width: number,
  height: number,
  cells: Cell[],
  distanceMultiplier: number = 1
): { cell: Cell; direction: Point }[] {
  const directions: Point[] = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ];

  return directions
    .map((direction) => {
      return {
        cell: getCell(
          cells,
          width,
          add(cell, scale(direction, distanceMultiplier))
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

function getCell(cells: Cell[], width: number, { x, y }: Point): Cell {
  if (x < 0 || y < 0) {
    return undefined as unknown as Cell;
  }

  return cells[x + width * y];
}

export { createMaze };
