<script setup lang="ts">
const props = defineProps<CategoryCardProps>();
</script>

<template>
  <div class="category-card">
    <div class="cat-num">
      {{ String(catNum).padStart(2, "0") }}
    </div>
    <div class="cat-content">
      <div class="cat-name">
        {{ props.name }}
      </div>
      <div class="cat-meta">
        {{ catNomineesLength }} nominados · {{ votes }} voto{{
          votes === 1 ? "" : "s"
        }}
        &nbsp;
        <span v-if="status === 'open'" class="pill open"><span class="dot" />
          Votación abierta
        </span>
        <span v-else class="pill closed">🏆 {{ winnerName ? winnerName : "Sin votos" }}</span>
      </div>
    </div>
  </div>
</template>