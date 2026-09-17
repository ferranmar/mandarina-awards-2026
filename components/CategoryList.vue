<script setup lang="ts">

interface Category {
  id: string
  name: string
  total: number
  status: string
  nominees: {
    id: string
    name: string
  }[],
  counts: Record<string, number>
}
interface Props {
  categories: Category[]
}
const props = defineProps<Props>()
const emit = defineEmits<{ openDetail: [id: string] }>()

function winnerFor(cat: Category): Category["nominees"][number] | null {
  if (!cat.total) return null;
  let best = null, bestCount = -1
  cat.nominees.forEach(n => {
    const c = cat.counts[n.id] || 0
    if (c > bestCount) { best = n; bestCount = c }
  })
  return best
}
</script>

<template>
  <div v-if="props.categories.length === 0" class="empty">
    <p>Todavía no hay categorías. La persona anfitriona puede crear la primera desde el panel de anfitrión.</p>
    <small class="hint">Toca "Soy la persona anfitriona" arriba si te toca crear los
      premios.</small>
  </div>
  <div v-else>
    <CategoryCard
      v-for="(cat, i) in categories" :key="cat.id" :name="cat.name" :cat-num="i + 1"
      :cat-nominees-length="cat.nominees.length" :votes="cat.total" :status="cat.status" :winner-name="winnerFor(cat)?.name"
      @click="emit('openDetail', cat.id)" />
  </div>
</template>