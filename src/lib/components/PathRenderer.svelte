<script lang="ts" module>
  function getKey(point: Point): CellKey;
  function getKey(x: number, y: number): CellKey;
  function getKey(x: number | Point, y?: number): CellKey {
    if (typeof x !== "number") {
      y = x.y;
      x = x.x;
    }

    return `${x},${y as number}`;
  }

  type PathfindingAlgorithm = (
    start: Point,
    end: Point,
    width: number,
    height: number,
    walls: SvelteSet<CellKey>
  ) => Generator<AlgorithmStep, void, void>;

  type AlgorithmStep = {
    path: Point[];
    visited: SvelteSet<CellKey>;
    frontier: SvelteSet<CellKey>;
  };

  export { getKey, type PathfindingAlgorithm, type AlgorithmStep };
</script>

<script lang="ts">
  import { createMaze } from "$lib/createMaze";
  import { equal, type Point } from "$lib/point";
  import { onDestroy } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import { writable } from "svelte/store";

  type Props = {
    width: number;
    height: number;
    walls?: SvelteSet<CellKey>;
    start?: Point;
    end?: Point;
    pathfindingAlgorithm: PathfindingAlgorithm;
  };

  export type CellKey = `${number},${number}`;
  type DragAction = "add" | "remove" | "movestart" | "movegoal";

  let {
    width,
    height,
    start = $bindable({ x: 0, y: 0 }),
    end = $bindable({ x: width - 1, y: height - 1 }),
    walls = $bindable(createMaze(width, height, start, end)),
    pathfindingAlgorithm: algorithm = $bindable(),
  }: Props = $props();

  let mouseDown = false;
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  let toggled = new Set<CellKey>();
  // initial value doesn't matter
  let dragAction: DragAction = "add";
  let visualisationData = writable({
    path: [] as Point[],
    visited: new SvelteSet<CellKey>(),
    frontier: new SvelteSet<CellKey>(),
  });
  let intervalHandle: NodeJS.Timeout | null = null;

  let visualisationStarted = false;
  export function startVisualisation(onlyUpdate: boolean = false): void {
    if (visualisationStarted) {
      clearVisualisation();
    }

    if (onlyUpdate && !visualisationStarted) {
      return;
    }

    visualisationStarted = true;
    const pathGenerator = algorithm(start, end, width, height, walls);

    if (intervalHandle !== null) {
      clearInterval(intervalHandle);
    }

    intervalHandle = setInterval(() => {
      const newPath = pathGenerator.next();

      if (newPath.done) {
        clearInterval(intervalHandle as NodeJS.Timeout);
        intervalHandle = null;
        visualisationStarted = false;
      } else {
        $visualisationData = newPath.value;
      }
    }, 10);
  }

  export function stopVisualisation(): void {
    visualisationStarted = false;
    clearVisualisation();

    if (intervalHandle !== null) {
      clearInterval(intervalHandle);
    }
  }

  export function clearVisualisation(): void {
    $visualisationData = {
      path: [],
      visited: new SvelteSet<CellKey>(),
      frontier: new SvelteSet<CellKey>(),
    };
  }

  function cellOnMouseDown(cell: Point, rightClick: boolean): void {
    if (visualisationStarted) {
      return;
    }

    clearVisualisation();

    mouseDown = true;

    if (rightClick) {
      dragAction = "remove";
    } else if (equal(cell, start)) {
      dragAction = "movestart";
    } else if (equal(cell, end)) {
      dragAction = "movegoal";
    } else {
      dragAction = "add";
    }

    cellOnMouseMove(cell);
    toggled.add(getKey(cell));
  }

  function cellOnMouseMove(cell: Point): void {
    const key = getKey(cell);
    if (
      visualisationStarted ||
      !mouseDown ||
      equal(cell, start) ||
      equal(cell, end)
    ) {
      return;
    }

    switch (dragAction) {
      case "add": {
        if (!toggled.has(key)) {
          walls.add(key);
        }

        break;
      }
      case "remove": {
        if (!toggled.has(key)) {
          walls.delete(key);
        }

        break;
      }
      case "movestart": {
        if (!equal(cell, end)) {
          start = cell;
        }

        break;
      }
      case "movegoal": {
        if (!equal(cell, start)) {
          end = cell;
        }

        break;
      }
    }

    toggled.add(key);
  }

  function cellOnMouseUp(cell: Point): void {
    if (visualisationStarted) {
      return;
    }

    switch (dragAction) {
      case "movestart":
      // fallthrough
      case "movegoal": {
        const key = getKey(cell);

        walls.delete(key);
      }
    }
  }

  function documentOnMouseUp(): void {
    if (visualisationStarted) {
      return;
    }

    mouseDown = false;
    toggled.clear();
  }

  onDestroy(() => {
    if (intervalHandle !== null) {
      clearInterval(intervalHandle);
    }
  });
</script>

<svelte:document
  onmouseup={() => {
    documentOnMouseUp();
  }}
/>

<div class="container">
  <div class="grid" style="grid-template-columns: repeat({width}, 1fr)">
    {#each { length: width }, x}
      {#each { length: height }, y}
        {@const position = { x, y }}
        {@const key = getKey(position)}
        <div
          class="cell"
          class:wall={walls.has(key)}
          class:start={equal(position, start)}
          class:goal={equal(position, end)}
          class:path={$visualisationData.path.some((tile) =>
            equal(position, tile)
          )}
          class:visited={$visualisationData.visited.has(key)}
          class:frontier={$visualisationData.frontier.has(key)}
          style="grid-column-start: {x + 1}; grid-row-start: {y + 1};"
          onmousedown={(event) => {
            // event.button === 2 is a right click
            cellOnMouseDown(position, event.button === 2);
          }}
          onmousemove={() => {
            cellOnMouseMove(position);
          }}
          onmouseup={() => {
            cellOnMouseUp(position);
          }}
          oncontextmenu={(event) => {
            event.preventDefault();
          }}
          role="cell"
          tabindex="-1"
        ></div>
      {/each}
    {/each}
  </div>
</div>

<style lang="scss">
  .container {
    width: 100%;
  }

  .grid {
    display: grid;

    .cell {
      border: 1px solid black;
      aspect-ratio: 1;
      box-sizing: border-box;
      user-select: none;

      background-color: #ddd;

      &.visited {
        background-color: #888;
      }

      &.frontier {
        background-color: #f0f;
      }

      &.path {
        background-color: #00f;
      }

      &.wall {
        background-color: #000;
      }

      &.start {
        background-color: #0f0;
      }

      &.goal {
        background-color: #f00;
      }

      &:focus {
        outline: none;
      }
    }
  }
</style>
