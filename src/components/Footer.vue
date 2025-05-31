<template>
  <footer class="site-footer">
    <p>
      Warwyn is a fan-made project and is not affiliated with, endorsed by, or authorized by Jagex Ltd. We just really love the game.
    </p>
    <p>
      All content copyright © {{ currentYear }} Warwyn. Built by players, for players. All rights reserved.
    </p>
    <p class="dev-tag">
      Site designed and developed by Gallus
    </p>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  text-align: center;
  padding: 2rem 1rem;
  font-size: 0.9rem;
  color: var(--text-light);
  background-color: var(--bg-darker);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}
.dev-tag {
  font-size: 0.7rem;
  color: var(--accent-hover);
}
</style>