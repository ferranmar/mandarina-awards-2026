<script setup lang="ts">

const props = defineProps<{
  categories: Category[]
}>()
const emit = defineEmits<{
  toggleStatus: [cat: Category],
  resetVotes: [cat: Category],
  deleteCategory: [cat: Category]
}>()
</script>

<template>
  <div class="admin-box">
    <h3>Categorías ({{ props.categories.length }})</h3>
    <p v-if="categories.length === 0" style="color:var(--muted);font-size:14px;">Aún no hay categorías.</p>
    <div v-for="cat in categories" :key="cat.id" class="admin-cat-item">
      <div class="title">{{ cat.name }} 
        <span style="color:var(--muted);font-weight:400;">({{ cat.nominees.length}} nominados, {{ cat.total }} votos)</span>
      </div>
      <div class="row" style="margin-top:8px;">
        <button class="btn secondary" @click="emit('toggleStatus', cat)">
          {{ cat.status === 'open' ? 'Cerrar votación' : 'Reabrir votación' }}
        </button>
        <button class="btn secondary" @click="emit('resetVotes', cat)">Reiniciar votos</button>
        <button class="btn danger" @click="emit('deleteCategory', cat)">Eliminar</button>
      </div>
    </div>
  </div>
</template>