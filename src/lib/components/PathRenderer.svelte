<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";

  type Props = {
    width: number;
    height: number;
    walls?: SvelteSet<CellKey>;
  };

  type CellKey = `${number},${number}`;
  type DragAction = "add" | "remove";

  let { width, height, walls = new SvelteSet() }: Props = $props();

  let mouseDown = false;
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  let toggled = new Set<CellKey>();
  // initial value doesn't matter
  let dragAction: DragAction = "add";

  function cellOnMouseDown(
    x: number,
    y: number,
    action: "add" | "remove"
  ): void {
    mouseDown = true;
    dragAction = action;

    toggled.add(getKey(x, y));

    cellOnMouseMove(x, y);
  }

  function cellOnMouseMove(x: number, y: number): void {
    const key = getKey(x, y);
    if (!mouseDown || toggled.has(key)) {
      return;
    }

    toggled.add(key);

    if (dragAction === "add") {
      walls.add(key);
    } else {
      walls.delete(key);
    }
  }

  function getKey(x: number, y: number): CellKey {
    return `${x},${y}`;
  }
</script>

<svelte:document
  onmouseup={() => {
    mouseDown = false;
    toggled.clear();
  }}
/>

<div class="container">
  <div class="grid" style="grid-template-columns: repeat({width}, 1fr)">
    {#each { length: width }, x}
      {#each { length: height }, y}
        <div
          class="cell"
          class:wall={walls.has(getKey(x, y))}
          onmousedown={(event) => {
            // right click = remove
            cellOnMouseDown(x, y, event.button === 2 ? "remove" : "add");
          }}
          onmousemove={() => {
            cellOnMouseMove(x, y);
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
    }
  }
</style>
