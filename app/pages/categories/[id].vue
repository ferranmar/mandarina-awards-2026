<script setup lang="ts">
const route = useRoute()
const { myVotes, categories, castVote } = useVoting()

const category = computed(() => categories.value.find(c => c.id === route.params.id))

const voteError = ref("")

function backToList() {
  return navigateTo("/")
}

async function handleCastVote(nomineeId: string) {
  if (!category.value || category.value.status !== 'open') return
  voteError.value = ''
  try {
    await castVote(category.value.id, nomineeId)
  } catch (e: any) {
    voteError.value = e?.data?.statusMessage || 'No se pudo registrar el voto'
  }
}

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
    <button class="link-btn" @click="backToList">&larr; Volver al programa</button>
    <div v-if="category">
      <div class="detail-header">
        <span :class="['pill', category.status === 'open' ? 'open' : 'closed']">
          {{ category.status === 'open' ? 'Votación abierta' : 'Votación cerrada' }}
        </span>
        <h2>{{ category.name }}</h2>
        <p style="color:var(--muted);font-size:13px;margin:0 0 18px;">
          {{ category.total }} voto{{ category.total === 1 ? '' : 's' }} en total
        </p>
      </div>
      <p v-if="voteError" class="error-msg">{{ voteError }}</p>
      <div>
        <button v-for="n in category.nominees" :key="n.id" class="nominee"
          :class="{ voted: myVotes[category.id] === n.id, winner: category.status === 'closed' && winnerFor(category)?.id === n.id }"
          :disabled="category.status !== 'open'" @click="handleCastVote(n.id)">
          <div class="nominee-bar"
            :style="{ width: (category.total > 0 ? Math.round(((category.counts[n.id] || 0) / category.total) * 100) : 0) + '%' }" />
          <div class="nominee-content">
            <span class="nominee-name">
              <span v-if="category.status === 'closed' && winnerFor(category)?.id === n.id" class="crown">
                🏆
              </span>
              {{ n.name }}
              <span v-if="myVotes[category.id] === n.id" class="check">
                ✓ tu voto
              </span>
            </span>
            <span class="nominee-stats">
              {{ category.total > 0 ? Math.round(((category.counts[n.id] || 0) /
                category.total) * 100) : 0 }}% · {{ category.counts[n.id] || 0 }}
            </span>
          </div>
        </button>
      </div>
    </div>

  </div>


</template>