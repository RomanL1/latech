<script setup lang="ts">
import CollaborativeEditor from './components/CollaborativeEditor.vue'
</script>

<template>
  <main>
    <div class="welcome">
      <h1>Collaborative Editor Prototype</h1>
      <p>Open this page in multiple tabs to see Y.js and Monaco cursor syncing in real-time!</p>
    </div>

    <CollaborativeEditor />
  </main>
</template>

<style scoped>
main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
}

.welcome {
  margin-bottom: 2rem;
  text-align: center;
}

.welcome h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.welcome p {
  font-size: 1.1rem;
  color: var(--color-text);
  opacity: 0.8;
}
</style>
