<script lang="ts">
  import PathRenderer, {
    type CellKey,
  } from "$lib/components/PathRenderer.svelte";
  import { createMaze } from "$lib/createMaze";
  import { SvelteSet } from "svelte/reactivity";

  // eslint-ignore svelte/no-unnecessary-state-wrap
  let walls = $state(new SvelteSet<CellKey>());
  let width = $state(50);
  let height = $state(25);
  let start: [number, number] = $state([0, 0]);
  let end: [number, number] = $state([49, 24]);

  function clear(): void {
    walls.clear();
  }

  function generateMaze(): void {
    walls = createMaze(width, height, start, end);
  }
</script>

<svelte:head>
  <title>Pathfinder</title>
</svelte:head>

<main>
  <h1>Pathfinder</h1>

  <div class="centre" style="left: -8px; position: relative;">
    <div class="path-container">
      <PathRenderer {width} {height} bind:start bind:end bind:walls />
    </div>

    <div>
      <button onclick={clear}>Clear</button>
      <button onclick={generateMaze}>Generate Maze</button>
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
