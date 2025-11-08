<script lang="ts">
  import { astar } from "$lib/algorithms/astar";
  import { dijkstra } from "$lib/algorithms/dijkstra";
  import PathRenderer, {
    type CellKey,
    type PathfindingAlgorithm,
  } from "$lib/components/PathRenderer.svelte";
  import { createMaze } from "$lib/createMaze";
  import { SvelteSet } from "svelte/reactivity";

  const PATHFINDING_ALGORITHMS = {
    dijkstra: {
      name: "Dijkstra's Algorithm",
      algorithm: dijkstra,
    },
    astar: {
      name: "A*",
      algorithm: astar,
    },
  } as const satisfies Record<
    string,
    { name: string; algorithm: PathfindingAlgorithm }
  >;

  // eslint-disable-next-line svelte/no-unnecessary-state-wrap
  let walls = $state(new SvelteSet<CellKey>());
  let width = $state(50);
  let height = $state(25);
  let start: Pair<number> = $state([0, 0]);
  let end: Pair<number> = $state([49, 24]);
  let renderer: PathRenderer;

  let algorithmName: keyof typeof PATHFINDING_ALGORITHMS = $state("astar");
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
</svelte:head>

<main>
  <h1>Pathfinder</h1>

  <div class="centre" style="left: -8px; position: relative;">
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

    scrollbar-width: 0;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  main {
    width: 100vw;
    height: 100vh;

    padding: 8px;

    overflow: hidden scroll;
  }

  h1 {
    text-align: center;
  }

  .centre {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
  }

  .path-container {
    width: 85vw;
    padding-bottom: 2em;
  }
</style>
