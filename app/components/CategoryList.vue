<script setup lang="ts">

const { categories } = useVoting()

function winnerFor(cat: Category): Nominee | null {
  if (!cat.total) return null;
  let best = null, bestCount = -1
  cat.nominees.forEach(n => {
    const c = cat.counts[n.id] || 0
    if (c > bestCount) { best = n; bestCount = c }
  })
  return best
}

function openDetail(id: string) {
  return navigateTo({
    name: "categories-id",
    params: { id: id },
  })
}
</script>

<template>
  <div>
    <div v-if="categories.length === 0" class="empty">
      <p>Todavía no hay categorías. La persona anfitriona puede crear la primera desde el panel de anfitrión.</p>
      <small class="hint">Toca "Soy la persona anfitriona" arriba si te toca crear los
        premios.</small>
    </div>
    <div v-else class="category-list">
      <CategoryCard 
        v-for="(cat, i) in categories" 
        :key="cat.id" :name="cat.name" :cat-num="i + 1"
        :cat-nominees-length="cat.nominees.length" :votes="cat.total" :status="cat.status"
        :winner-name="winnerFor(cat)?.name" @click="openDetail(cat.id)" />
    </div>
  </div>
</template>