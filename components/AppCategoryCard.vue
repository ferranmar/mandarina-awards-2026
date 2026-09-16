<script setup lang="ts">
interface Props {
  name: string;
  catNum: number;
  catNomineesLength: number;
  votes: number;
  status: string;
  winner?: string;
}
const props = defineProps<Props>();
</script>

<template>
  <div class="category-card">
    <div class="cat-num">{{ String(catNum).padStart(2, "0") }}</div>
    <div style="flex: 1">
      <div class="cat-name">{{ props.name }}</div>
      <div class="cat-meta">
        {{ catNomineesLength }} nominados · {{ votes }} voto{{
          votes === 1 ? "" : "s"
        }}
        &nbsp;
        <span v-if="status === 'open'" class="pill open"><span class="dot" style="width: 5px; height: 5px"></span>
          Votación abierta
        </span>
        <span v-else class="pill closed">🏆 {{ winner ? winner : "Sin votos" }}</span>
      </div>
    </div>
  </div>
</template>
