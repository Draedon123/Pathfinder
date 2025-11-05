<script lang="ts">
  let { children }: WithChildren = $props();
</script>

<svelte:head>
  <!-- <link href="favicon.svg" rel="icon" /> -->
</svelte:head>

{@render children?.()}
