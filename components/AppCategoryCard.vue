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
        <span v-else class="pill closed">🏆 {{ winner ? winner : "Sin votos" }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cat-content {
  flex: 1
}

.cat-name {
  font-family: "Fraunces", serif;
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 6px;
  transition: color 0.15s ease;
}

.cat-num {
  font-family: "Fraunces", serif;
  font-size: 15px;
  color: var(--muted);
  padding-top: 3px;
  min-width: 24px;
}

.cat-meta {
  font-size: 13px;
  color: var(--muted);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 20px;
  border: 1px solid var(--card-border);
}

.pill.open {
  color: var(--gold);
  border-color: var(--gold-soft);
}

.pill.closed {
  color: var(--muted);
}

.dot {
  width: 5px;
  height: 5px
}

.category-card {
  border-top: 1px solid var(--card-border);
  padding: 20px 4px;
  cursor: pointer;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.category-card:last-child {
  border-bottom: 1px solid var(--card-border);
}

.category-card:hover .cat-name {
  color: var(--gold);
}
</style>