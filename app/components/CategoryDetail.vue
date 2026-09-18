<script setup lang="ts">
const emit = defineEmits<{backToList: [], castVote: [categoryId: string, nomineeId: string]}>()
defineProps<{selectedCategory: Category, voteError: string, myVotes: Record<string, string>}>()

function winnerFor(cat: Category): Nominee | null {
  if (!cat.total) return null
  let best: Nominee | null = null, bestCount = -1
  cat.nominees.forEach((n: Nominee) => {
    const c = cat.counts[n.id] || 0
    if (c > bestCount) { best = n; bestCount = c }
  })
  return best
}
</script>

<template>
    <div>
        <button class="link-btn" @click="emit('backToList')">&larr; Volver al programa</button>
        <div class="detail-header">
            <span :class="['pill', selectedCategory.status === 'open' ? 'open' : 'closed']">
                {{ selectedCategory.status==='open' ? 'Votación abierta' : 'Votación cerrada' }}
            </span>
            <h2>{{ selectedCategory.name }}</h2>
            <p style="color:var(--muted);font-size:13px;margin:0 0 18px;">
                {{ selectedCategory.total }} voto{{selectedCategory.total === 1 ? '' : 's' }} en total
            </p>
        </div>
        <p v-if="voteError" class="error-msg">{{ voteError }}</p>
        <div>
            <button 
                v-for="n in selectedCategory.nominees" :key="n.id" class="nominee"
                :class="{ voted: myVotes[selectedCategory.id] === n.id, winner: selectedCategory.status === 'closed' && winnerFor(selectedCategory)?.id === n.id }"
                :disabled="selectedCategory.status !== 'open'" @click="emit('castVote', selectedCategory.id, n.id)"
            >
                <div 
                    class="nominee-bar"
                    :style="{ width: (selectedCategory.total > 0 ? Math.round(((selectedCategory.counts[n.id] || 0) / selectedCategory.total) * 100) : 0) + '%' }" 
                />
                <div class="nominee-content">
                    <span class="nominee-name">
                        <span v-if="selectedCategory.status === 'closed' && winnerFor(selectedCategory)?.id === n.id" class="crown">
                            🏆
                        </span>
                        {{ n.name }}
                        <span v-if="myVotes[selectedCategory.id] === n.id" class="check">
                            ✓ tu voto
                        </span>
                    </span>
                    <span class="nominee-stats">
                        {{ selectedCategory.total > 0 ? Math.round(((selectedCategory.counts[n.id] || 0) / selectedCategory.total) * 100) : 0 }}% · {{selectedCategory.counts[n.id] || 0 }}
                    </span>
                </div>
            </button>
        </div>
    </div>
</template>