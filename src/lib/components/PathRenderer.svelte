<script lang="ts">
  type Props = {
    width: number;
    height: number;
  };

  let { width, height }: Props = $props();
</script>

<div class="container">
  <div class="grid" style="grid-template-columns: repeat({width}, 1fr)">
    {#each { length: width } as x}
      {#each { length: height } as y}
        <div class="cell"></div>
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
    }
  }
</style>
