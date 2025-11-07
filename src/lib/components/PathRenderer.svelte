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
  ) => Pair<number>[];

  export { getKey, type PathfindingAlgorithm };
</script>

<script lang="ts">
  import { astar } from "$lib/algorithms/astar";

  import { createMaze } from "$lib/createMaze";
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
    pathfindingAlgorithm: algorithm = astar,
  }: Props = $props();

  let mouseDown = false;
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  let toggled = new Set<CellKey>();
  // initial value doesn't matter
  let dragAction: DragAction = "add";
  let path = $derived(algorithm(start, end, width, height, walls));

  function cellOnMouseDown(x: number, y: number, rightClick: boolean): void {
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
    mouseDown = false;
    toggled.clear();
  }
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
        <div
          class="cell"
          class:wall={walls.has(getKey(x, y))}
          class:start={x === start[0] && y === start[1]}
          class:goal={x === end[0] && y === end[1]}
          class:path={path.some((tile) => tile[0] === x && tile[1] === y)}
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

      &.path {
        background-color: #888;
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
