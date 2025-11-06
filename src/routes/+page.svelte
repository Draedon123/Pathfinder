<script lang="ts">
  import PathRenderer from "$lib/components/PathRenderer.svelte";
</script>

<svelte:head>
  <title>Pathfinder</title>
</svelte:head>

<main>
  <h1>Pathfinder</h1>

  <div class="centre" style="left: -8px; position: relative;">
    <div class="path-container">
      <PathRenderer width={51} height={25} />
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
    justify-content: center;

    width: 100%;
  }

  .path-container {
    width: 85vw;
    padding-bottom: 2em;
  }
</style>
