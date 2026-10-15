<script setup lang="ts">
const { isAdmin } = useVoting()
</script>
<template>
  <header>
    <nav>
      <ul>
        <li>
          <NuxtLink to="/" exact-active-class="is-active">
            Votaciones
          </NuxtLink>
        </li>
        <li v-if="isAdmin">
          <NuxtLink to="/mandarinafilm" exact-active-class="is-active">
            Video
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>