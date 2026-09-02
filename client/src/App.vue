<template>
  <div id="app" class="app-shell">
    <main-header />

    <main class="app-main">
      <router-view />
    </main>

    <main-footer />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding-top: 0.75rem;
}
</style>
