import type { PathfindingAlgorithm } from "$lib/components/PathRenderer.svelte";
import { astar } from "./astar";

const ucs: PathfindingAlgorithm = (start, end, width, height, walls) =>
  astar(() => 0, start, end, width, height, walls);

export { ucs };
