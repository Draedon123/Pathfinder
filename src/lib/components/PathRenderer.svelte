<script lang="ts" module>
  function getKey(x: number, y: number): CellKey {
    return `${x},${y}`;
  }

  type PathfindingAlgorithm = (
    start: Pair<number>,
    end: Pair<number>,
    width: number,
    height: number,
    walls: SvelteSet<CellKey>
  ) => Generator<AlgorithmStep, void, void>;

  type AlgorithmStep = {
    path: Pair<number>[];
    visited: SvelteSet<CellKey>;
    frontier: SvelteSet<CellKey>;
  };

  export { getKey, type PathfindingAlgorithm, type AlgorithmStep };
</script>

<script lang="ts">
  import { astar } from "$lib/algorithms/astar";

  import { createMaze } from "$lib/createMaze";
  import { onDestroy } from "svelte";
  import { SvelteSet } from "svelte/reactivity";

  type Props = {
    width: number;
    height: number;
    walls?: SvelteSet<CellKey>;
    start?: Pair<number>;
    end?: Pair<number>;
    pathfindingAlgorithm?: PathfindingAlgorithm;
  };

  export type CellKey = `${number},${number}`;
  type DragAction = "add" | "remove" | "movestart" | "movegoal";

  let {
    width,
    height,
    start = $bindable([0, 0]),
    end = $bindable([width - 1, height - 1]),
    walls = $bindable(createMaze(width, height, start, end)),
    pathfindingAlgorithm: algorithm = $bindable(astar),
  }: Props = $props();

  let mouseDown = false;
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  let toggled = new Set<CellKey>();
  // initial value doesn't matter
  let dragAction: DragAction = "add";
  let path: [number, number][] = $state([]);
  // svelte-ignore non_reactive_update
  let visited = new SvelteSet<CellKey>();
  // svelte-ignore non_reactive_update
  let frontier = new SvelteSet<CellKey>();
  let intervalHandle: NodeJS.Timeout | null = null;

  let visualisationStarted = false;
  export function startVisualisation(onlyUpdate: boolean = false): void {
    if (visualisationStarted) {
      path = [];
      visited.clear();
      frontier.clear();
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
      } else {
        path = newPath.value.path;
        visited = newPath.value.visited;
        frontier = newPath.value.frontier;
      }
    }, 5);
  }

  export function stopVisualisation(): void {
    visualisationStarted = false;
    path = [];

    if (intervalHandle !== null) {
      clearInterval(intervalHandle);
    }
  }

  function cellOnMouseDown(x: number, y: number, rightClick: boolean): void {
    if (visualisationStarted) {
      return;
    }

    mouseDown = true;

    if (rightClick) {
      dragAction = "remove";
    } else if (x === start[0] && y === start[1]) {
      dragAction = "movestart";
    } else if (x === end[0] && y === end[1]) {
      dragAction = "movegoal";
    } else {
      dragAction = "add";
    }

    cellOnMouseMove(x, y);
    toggled.add(getKey(x, y));
  }

  function cellOnMouseMove(x: number, y: number): void {
    const key = getKey(x, y);
    if (
      visualisationStarted ||
      !mouseDown ||
      (x === start[0] && y === start[1]) ||
      (x === end[0] && y === end[1])
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
        if (x !== end[0] || y !== end[1]) {
          start = [x, y];
        }

        break;
      }
      case "movegoal": {
        if (x !== start[0] || y !== start[1]) {
          end = [x, y];
        }

        break;
      }
    }

    toggled.add(key);
  }

  function cellOnMouseUp(x: number, y: number): void {
    if (visualisationStarted) {
      return;
    }

    switch (dragAction) {
      case "movestart":
      // fallthrough
      case "movegoal": {
        const key = getKey(x, y);

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
        {@const key = getKey(x, y)}
        <div
          class="cell"
          class:wall={walls.has(key)}
          class:start={x === start[0] && y === start[1]}
          class:goal={x === end[0] && y === end[1]}
          class:path={path.some((tile) => tile[0] === x && tile[1] === y)}
          class:visited={visited.has(key)}
          class:frontier={frontier.has(key)}
          style="grid-column-start: {x + 1}; grid-row-start: {y + 1};"
          onmousedown={(event) => {
            // event.button === 2 is a right click
            cellOnMouseDown(x, y, event.button === 2);
          }}
          onmousemove={() => {
            cellOnMouseMove(x, y);
          }}
          onmouseup={() => {
            cellOnMouseUp(x, y);
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

      &.wall {
        background-color: #000;
      }

      &.visited {
        background-color: #888;
      }

      &.frontier {
        background-color: #f0f;
      }

      &.path {
        background-color: #00f;
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
