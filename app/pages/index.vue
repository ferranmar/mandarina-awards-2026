<script setup lang="ts">
const categories = ref<Category[]>([])
const myVotes = ref<Record<string, string>>({})
const voterName = ref<string | null>(null)
const nameInput = ref('')
const nameError = ref('')

const isAdmin = ref(false)
const showAdminLogin = ref(false)
const adminPassword = ref('')
const adminError = ref('')


const viewMode = ref<'list' | 'admin' | 'detail'>('list')
const selectedCategoryId = ref<string | null>(null)
const selectedCategory = computed(() =>
  categories.value.find(c => c.id === selectedCategoryId.value) ?? null
)

const voteError = ref('')
const connected = ref(false)

const categoryForm = ref({
  catName: '',
  catNominees: ['', '']
})
const categoryFormError = ref('')

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null


function connectSocket() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  socket = new WebSocket(`${proto}://${location.host}/api/ws`)
  socket.onopen = () => { connected.value = true }
  socket.onclose = () => {
    connected.value = false
    reconnectTimer = setTimeout(connectSocket, 2000)
  }
  socket.onerror = () => { socket?.close() }
  socket.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'state') {
        categories.value = msg.payload.categories
      }
    } catch {}
  }
}

onMounted(async () => {
  try {
    const data = await $fetch('/api/state')
    categories.value = data.categories
    myVotes.value = data.myVotes || {}
    voterName.value = data.voterName
  } catch {}

  try {
    const me = await $fetch('/api/admin/me')
    isAdmin.value = !!me.isAdmin
  } catch {}

  connectSocket()
})

onBeforeUnmount(() => {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  if (socket) socket.close()
})

async function submitName() {
  const name = nameInput.value.trim()
  if (!name) { nameError.value = 'Escribe tu nombre'; return }
  try {
    const res = await $fetch('/api/register', { method: 'POST', body: { name } })
    voterName.value = res.name
    nameError.value = ''
  } catch (e: any) {
    nameError.value = e?.data?.statusMessage || 'No se pudo registrar'
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

async function castVote(categoryId: string, nomineeId: string) {
  const cat = categories.value.find(c => c.id === categoryId)
  if (!cat || cat.status !== 'open') return
  voteError.value = ''
  try {
    await $fetch('/api/vote', { method: 'POST', body: { categoryId, nomineeId } })
    myVotes.value = { ...myVotes.value, [categoryId]: nomineeId }
  } catch (e: any) {
    voteError.value = e?.data?.statusMessage || 'No se pudo registrar el voto'
  }
}

function openDetail(id: string) { 
  selectedCategoryId.value = id
  viewMode.value = 'detail'
}
function backToList() { 
  viewMode.value = 'list'
  selectedCategoryId.value = null
}

async function loginAdmin() {
  adminError.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: adminPassword.value } })
    isAdmin.value = true
    showAdminLogin.value = false
    adminPassword.value = ''
    viewMode.value = 'admin'
  } catch (e: any) {
    adminError.value = e?.data?.statusMessage || 'Contraseña incorrecta'
  }
}

async function logoutAdmin() {
  try { await $fetch('/api/admin/logout', { method: 'POST' }) } catch {}
  isAdmin.value = false
  if (viewMode.value === 'admin') viewMode.value = 'list'
}

function addNomineeField() { categoryForm.value.catNominees.push('') }

async function submitCategory() {
  categoryFormError.value = ''
  const name = categoryForm.value.catName.trim()
  const nominees = categoryForm.value.catNominees.map(n => n.trim()).filter(Boolean)
  if (!name || nominees.length < 2) {
    categoryFormError.value = 'Ponle un nombre a la categoría y al menos 2 nominados.'
    return
  }
  try {
    await $fetch('/api/admin/category', { method: 'POST', body: { name, nominees } })
    categoryForm.value.catName = ''
    categoryForm.value.catNominees = ['', '']
  } catch (e: any) {
    categoryFormError.value = e?.data?.statusMessage || 'No se pudo crear la categoría'
  }
}

async function toggleStatus(cat: Category) {
  const status = cat.status === 'open' ? 'closed' : 'open'
  try {
    await $fetch(`/api/admin/category/${cat.id}`, { method: 'PATCH', body: { status } })
  } catch {}
}

async function resetVotes(cat: Category) {
  if (!confirm('¿Borrar todos los votos de esta categoría?')) return
  try { await $fetch(`/api/admin/category/${cat.id}/reset`, { method: 'POST' }) } catch {}
}

async function deleteCategory(cat: Category) {
  if (!confirm('¿Eliminar esta categoría por completo?')) return
  try { await $fetch(`/api/admin/category/${cat.id}`, { method: 'DELETE' }) } catch {}
}
</script>

<template>
  <section>
    <div class="eyebrow">
      <span class="dot"/>
      <span :class="['conn-status', { live: connected }]">{{ connected ? 'En vivo' : 'Conectando…' }}</span>
    </div>
    <NameGate v-if="!voterName" v-model="nameInput" :name-error="nameError" @submit-name="submitName"/>
    <template v-else>
      <TopBar v-model="viewMode" :voter-name="voterName" :is-admin="isAdmin" @logout-admin="logoutAdmin" @toggle-admin-login="showAdminLogin= !showAdminLogin"/>
      <AdminBox v-if="showAdminLogin && !isAdmin" v-model="adminPassword" :admin-error="adminError" @login-admin="loginAdmin"/>
      

      <!-- ADMIN VIEW -->
      <div v-if="viewMode === 'admin'">
        <AdminNewCategoryForm v-model="categoryForm" :category-form-error="categoryFormError" @add-nominee-field="addNomineeField" @submit-category="submitCategory"/>
        <AdminCategoryList :categories="categories" @toggle-status="toggleStatus" @delete-category="deleteCategory" @reset-votes="resetVotes" />
      </div>

      <!-- DETAIL VIEW -->
      <div v-else-if="viewMode === 'detail' && selectedCategory">
        <button class="link-btn" @click="backToList">&larr; Volver al programa</button>
          <div class="detail-header">
            <span :class="['pill', selectedCategory.status === 'open' ? 'open' : 'closed']">{{ selectedCategory.status === 'open' ? 'Votación abierta' : 'Votación cerrada' }}</span>
            <h2>{{ selectedCategory.name }}</h2>
            <p style="color:var(--muted);font-size:13px;margin:0 0 18px;">{{ selectedCategory.total }} voto{{ selectedCategory.total === 1 ? '' : 's' }} en total</p>
          </div>
          <p v-if="voteError" class="error-msg">{{ voteError }}</p>
          <div>
            <button
              v-for="n in selectedCategory.nominees" :key="n.id"
              class="nominee"
              :class="{ voted: myVotes[selectedCategory.id] === n.id, winner: selectedCategory.status === 'closed' && winnerFor(selectedCategory)?.id === n.id }"
              :disabled="selectedCategory.status !== 'open'"
              @click="castVote(selectedCategory.id, n.id)"
            >
              <div class="nominee-bar" :style="{ width: (selectedCategory.total > 0 ? Math.round(((selectedCategory.counts[n.id]||0)/selectedCategory.total)*100) : 0) + '%' }"/>
              <div class="nominee-content">
                <span class="nominee-name">
                  <span v-if="selectedCategory.status === 'closed' && winnerFor(selectedCategory)?.id === n.id" class="crown">🏆</span>
                  {{ n.name }}
                  <span v-if="myVotes[selectedCategory.id] === n.id" class="check">✓ tu voto</span>
                </span>
                <span class="nominee-stats">{{ selectedCategory.total > 0 ? Math.round(((selectedCategory.counts[n.id]||0)/selectedCategory.total)*100) : 0 }}% · {{ selectedCategory.counts[n.id] || 0 }}</span>
              </div>
            </button>
          </div>
      </div>

      <!-- LIST VIEW -->
      <div v-else>
        <CategoryList :categories="categories" @open-detail="openDetail" />
      </div>
    </template>
  </section>
</template>
