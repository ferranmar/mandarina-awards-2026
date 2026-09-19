<script setup lang="ts">

const { voterName } = useVoting()
</script>

<template>
  <div class="topbar">
    <span>Votando como <b>{{ voterName }}</b></span>
    <NuxtLink to="/admin" class="link-btn">Soy la persona anfitriona</NuxtLink>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
}
</style>