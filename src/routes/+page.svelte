<script lang="ts">
  import { astarEuclidean, astarManhattan } from "$lib/algorithms/astar";
  import { bfs } from "$lib/algorithms/bfs";
  import { dfs } from "$lib/algorithms/dfs";
  import { dijkstra } from "$lib/algorithms/dijkstra";
  import PathRenderer, {
    type CellKey,
    type PathfindingAlgorithm,
  } from "$lib/components/PathRenderer.svelte";
  import { createMaze } from "$lib/createMaze";
  import type { Point } from "$lib/point";
  import { SvelteSet } from "svelte/reactivity";

  const PATHFINDING_ALGORITHMS = {
    astarEuclidean: {
      name: "A* (Euclidean Heuristic)",
      algorithm: astarEuclidean,
    },
    astarManhattan: {
      name: "A* (Manhattan Heuristic)",
      algorithm: astarManhattan,
    },
    bfs: {
      name: "Breadth-first Search",
      algorithm: bfs,
    },
    dfs: {
      name: "Depth-first Search",
      algorithm: dfs,
    },
    dijkstra: {
      name: "Dijkstra's Algorithm",
      algorithm: dijkstra,
    },
  } as const satisfies Record<
    string,
    { name: string; algorithm: PathfindingAlgorithm }
  >;

  // eslint-disable-next-line svelte/no-unnecessary-state-wrap
  let walls = $state(new SvelteSet<CellKey>());
  let width = $state(50);
  let height = $state(25);
  let start: Point = $state({ x: 0, y: 0 });
  let end: Point = $state({ x: 49, y: 24 });
  let renderer: PathRenderer;

  let algorithmName: keyof typeof PATHFINDING_ALGORITHMS =
    $state("astarEuclidean");
  let algorithm = $derived(PATHFINDING_ALGORITHMS[algorithmName].algorithm);

  function clear(): void {
    walls.clear();
    renderer.clearVisualisation();
    renderer.startVisualisation(true);
  }

  function generateMaze(): void {
    walls = createMaze(width, height, start, end);
    renderer.clearVisualisation();
    renderer.startVisualisation(true);
  }
</script>

<svelte:head>
  <title>Pathfinder</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main>
  <h1>Pathfinder</h1>

  <div class="centre" style="left: -8px; position: relative;">
    <div>
      <details>
        <summary>
          <h2 style="display: inline;">Guide</h2>
        </summary>
        <ul>
          <li>
            Left click and drag on the green and red squares (start and end
            respectively) to move them
          </li>
          <li>Left click and drag on the grid to place walls</li>
          <li>Right click and drag on the grid to delete walls</li>
          <li>Note that dragging too fast will skip grid cells</li>
          <li>You cannot edit the maze while the visualisation is running</li>
        </ul>
      </details>
    </div>

    <div class="path-container">
      <PathRenderer
        {width}
        {height}
        bind:start
        bind:end
        bind:walls
        bind:pathfindingAlgorithm={algorithm}
        bind:this={renderer}
      />
    </div>

    <div>
      <button onclick={clear}>Clear</button>
      <button onclick={generateMaze}>Generate Maze</button>
    </div>

    <select
      bind:value={algorithmName}
      onchange={() => {
        renderer.clearVisualisation();
        renderer.startVisualisation(true);
      }}
    >
      {#each Object.entries(PATHFINDING_ALGORITHMS) as [key, algorithm] (key)}
        <option value={key}>{algorithm.name}</option>
      {/each}
    </select>

    <div>
      <button
        onclick={() => {
          renderer.startVisualisation();
        }}>Start</button
      >
      <button
        onclick={() => {
          renderer.stopVisualisation();
        }}>Stop</button
      >
    </div>
  </div>
</main>

<style lang="scss">
  :global(body) {
    margin: 0;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 1.2ch;
    }

    &::-webkit-scrollbar-track {
      background: #ebcffa;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #666;
    }
  }

  main {
    width: 100vw;
    min-height: 100vh;

    padding: 8px;

    overflow-x: hidden;
    background: radial-gradient(
      circle,
      rgba(249, 82, 255, 0.4) 0%,
      rgba(115, 55, 204, 0.4) 100%
    );

    color: #fff;
    font-size: large;
    font-family: "Rubik";
  }

  h1,
  h2 {
    text-align: center;
    margin-bottom: 0;
    margin-top: 5px;
  }

  .centre {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;

    div {
      margin: 0.5em 0;
    }
  }

  .path-container {
    width: 85vw;
    margin-bottom: 2em;

    box-shadow: #c287c2 0 7px 29px;
  }

  button,
  select {
    border: 1px solid #1c7cac;

    color: white;
    font-family: "Rubik";

    background-color: #26acef;
    transition:
      background-color 0.25s,
      border-color 0.25s;

    cursor: pointer;

    &:hover {
      background-color: #2396cf;
      border-color: #1a77a5;
    }
  }

  button {
    height: 2em;
    font-size: large;
    border-radius: 15px;
  }

  select {
    appearance: none;
    width: max-content;
    padding: 0.675em 6em 0.675em 1em;
    border-radius: 5px;
  }

  details {
    display: flex;
    flex-direction: column;
    align-items: center;

    &[open] summary:before {
      content: "▼";
    }

    summary {
      list-style: none;

      display: flex;
      align-items: center;
      width: min-content;

      cursor: pointer;

      &::-webkit-details-marker {
        display: none;
      }

      &::before {
        content: "►";
      }
    }
  }
</style>
