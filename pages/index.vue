<script setup>
const categories = ref([])
const myVotes = ref({})
const voterName = ref(null)
const nameInput = ref('')
const nameError = ref('')

const isAdmin = ref(false)
const showAdminLogin = ref(false)
const adminPassword = ref('')
const adminError = ref('')

const stage = ref("intro"); // 'intro' | 'voting'
const view = ref('list') // 'list' | { type: 'detail', id } | 'admin'
const voteError = ref('')
const connected = ref(false)

const draftName = ref('')
const draftNominees = ref(['', ''])
const draftError = ref('')

let socket = null
let reconnectTimer = null

function connectSocket() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  socket = new WebSocket(`${proto}://${location.host}/api/ws`)
  socket.onopen = () => { connected.value = true }
  socket.onclose = () => {
    connected.value = false
    reconnectTimer = setTimeout(connectSocket, 2000)
  }
  socket.onerror = () => { socket && socket.close() }
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
  } catch (e) {
    nameError.value = e?.data?.statusMessage || 'No se pudo registrar'
  }
}

function tallyFor(cat) {
  return { counts: cat.counts, total: cat.total }
}

function winnerFor(cat) {
  if (!cat.total) return null
  let best = null, bestCount = -1
  cat.nominees.forEach(n => {
    const c = cat.counts[n.id] || 0
    if (c > bestCount) { best = n; bestCount = c }
  })
  return best
}

async function castVote(categoryId, nomineeId) {
  const cat = categories.value.find(c => c.id === categoryId)
  if (!cat || cat.status !== 'open') return
  voteError.value = ''
  try {
    await $fetch('/api/vote', { method: 'POST', body: { categoryId, nomineeId } })
    myVotes.value = { ...myVotes.value, [categoryId]: nomineeId }
  } catch (e) {
    voteError.value = e?.data?.statusMessage || 'No se pudo registrar el voto'
  }
}

function openDetail(id) { view.value = { type: 'detail', id } }
function backToList() { view.value = 'list' }

async function loginAdmin() {
  adminError.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: adminPassword.value } })
    isAdmin.value = true
    showAdminLogin.value = false
    adminPassword.value = ''
    view.value = 'admin'
  } catch (e) {
    adminError.value = e?.data?.statusMessage || 'Contraseña incorrecta'
  }
}

async function logoutAdmin() {
  try { await $fetch('/api/admin/logout', { method: 'POST' }) } catch {}
  isAdmin.value = false
  if (view.value === 'admin') view.value = 'list'
}

function addNomineeField() { draftNominees.value.push('') }

async function submitCategory() {
  draftError.value = ''
  const name = draftName.value.trim()
  const nominees = draftNominees.value.map(n => n.trim()).filter(Boolean)
  if (!name || nominees.length < 2) {
    draftError.value = 'Ponle un nombre a la categoría y al menos 2 nominados.'
    return
  }
  try {
    await $fetch('/api/admin/category', { method: 'POST', body: { name, nominees } })
    draftName.value = ''
    draftNominees.value = ['', '']
  } catch (e) {
    draftError.value = e?.data?.statusMessage || 'No se pudo crear la categoría'
  }
}

async function toggleStatus(cat) {
  const status = cat.status === 'open' ? 'closed' : 'open'
  try {
    await $fetch(`/api/admin/category/${cat.id}`, { method: 'PATCH', body: { status } })
  } catch {}
}

async function resetVotes(cat) {
  if (!confirm('¿Borrar todos los votos de esta categoría?')) return
  try { await $fetch(`/api/admin/category/${cat.id}/reset`, { method: 'POST' }) } catch {}
}

async function deleteCategory(cat) {
  if (!confirm('¿Eliminar esta categoría por completo?')) return
  try { await $fetch(`/api/admin/category/${cat.id}`, { method: 'DELETE' }) } catch {}
}

const settingsDraft = reactive({ title: '', subtitle: '' })
async function saveSettings() {
  try {
    await $fetch('/api/admin/settings', { method: 'POST', body: { title: settingsDraft.title, subtitle: settingsDraft.subtitle } })
    settingsDraft.title = ''
    settingsDraft.subtitle = ''
  } catch {}
}
</script>

<template>
  <div class="eyebrow">
    <span class="dot"></span>
    <span :class="['conn-status', { live: connected }]">{{ connected ? 'En vivo' : 'Conectando…' }}</span>
  </div>
  <div v-if="!voterName" class="name-gate">
    <h2>¿Cómo te llamas?</h2>
    <p>Así sabremos que ya votaste en cada categoría.</p>
    <input type="text" v-model="nameInput" placeholder="Tu nombre" @keydown.enter="submitName">
    <p v-if="nameError" class="error-msg">{{ nameError }}</p>
    <div class="row">
      <button class="btn" @click="submitName">Entrar a la ceremonia</button>
    </div>
  </div>

  <template v-else>
    <div class="topbar">
      <span>Votando como <b>{{ voterName }}</b></span>
      <span>
        <button v-if="isAdmin" class="link-btn" @click="view = view === 'admin' ? 'list' : 'admin'">
          {{ view === 'admin' ? 'Ver programa' : 'Panel de anfitrión' }}
        </button>
        <button v-if="isAdmin" class="link-btn" @click="logoutAdmin">Cerrar sesión de anfitrión</button>
        <button v-else class="link-btn" @click="showAdminLogin = !showAdminLogin">Soy la persona anfitriona</button>
      </span>
    </div>

    <div v-if="showAdminLogin && !isAdmin" class="admin-box">
      <h3>Acceso de anfitrión</h3>
      <input type="password" v-model="adminPassword" placeholder="Contraseña de anfitrión" @keydown.enter="loginAdmin">
      <p v-if="adminError" class="error-msg">{{ adminError }}</p>
      <div class="row">
        <button class="btn" @click="loginAdmin">Entrar</button>
      </div>
    </div>

    <!-- ADMIN VIEW -->
    <div v-if="view === 'admin'">
      <div class="admin-box">
        <h3>Nueva categoría</h3>
        <input type="text" v-model="draftName" placeholder="Nombre de la categoría, ej. Mejor anfitrión de fiestas">
        <div style="margin-top:10px;">
          <div class="nominee-input-row" v-for="(n, i) in draftNominees" :key="i">
            <input type="text" v-model="draftNominees[i]" placeholder="Nombre del nominado">
          </div>
        </div>
        <p v-if="draftError" class="error-msg">{{ draftError }}</p>
        <div class="row">
          <button class="btn secondary" @click="addNomineeField">+ Nominado</button>
          <button class="btn" @click="submitCategory">Agregar categoría</button>
        </div>
      </div>

      <div class="admin-box">
        <h3>Categorías ({{ categories.length }})</h3>
        <p v-if="categories.length === 0" style="color:var(--muted);font-size:14px;">Aún no hay categorías.</p>
        <div class="admin-cat-item" v-for="cat in categories" :key="cat.id">
          <div class="title">{{ cat.name }} <span style="color:var(--muted);font-weight:400;">({{ cat.nominees.length }} nominados, {{ cat.total }} votos)</span></div>
          <div class="row" style="margin-top:8px;">
            <button class="btn secondary" @click="toggleStatus(cat)">{{ cat.status === 'open' ? 'Cerrar votación' : 'Reabrir votación' }}</button>
            <button class="btn secondary" @click="resetVotes(cat)">Reiniciar votos</button>
            <button class="btn danger" @click="deleteCategory(cat)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL VIEW -->
    <div v-else-if="view.type === 'detail'">
      <button class="link-btn" @click="backToList">&larr; Volver al programa</button>
      <template v-for="cat in categories.filter(c => c.id === view.id)" :key="cat.id">
        <div class="detail-header">
          <span :class="['pill', cat.status === 'open' ? 'open' : 'closed']">{{ cat.status === 'open' ? 'Votación abierta' : 'Votación cerrada' }}</span>
          <h2>{{ cat.name }}</h2>
          <p style="color:var(--muted);font-size:13px;margin:0 0 18px;">{{ cat.total }} voto{{ cat.total === 1 ? '' : 's' }} en total</p>
        </div>
        <p v-if="voteError" class="error-msg">{{ voteError }}</p>
        <div>
          <button
            v-for="n in cat.nominees" :key="n.id"
            class="nominee"
            :class="{ voted: myVotes[cat.id] === n.id, winner: cat.status === 'closed' && winnerFor(cat) && winnerFor(cat).id === n.id }"
            :disabled="cat.status !== 'open'"
            @click="castVote(cat.id, n.id)"
          >
            <div class="nominee-bar" :style="{ width: (cat.total > 0 ? Math.round(((cat.counts[n.id]||0)/cat.total)*100) : 0) + '%' }"></div>
            <div class="nominee-content">
              <span class="nominee-name">
                <span class="crown" v-if="cat.status === 'closed' && winnerFor(cat) && winnerFor(cat).id === n.id">🏆</span>
                {{ n.name }}
                <span class="check" v-if="myVotes[cat.id] === n.id">✓ tu voto</span>
              </span>
              <span class="nominee-stats">{{ cat.total > 0 ? Math.round(((cat.counts[n.id]||0)/cat.total)*100) : 0 }}% · {{ cat.counts[n.id] || 0 }}</span>
            </div>
          </button>
        </div>
      </template>
    </div>

    <!-- LIST VIEW -->
    <div v-else>
      <div v-if="categories.length === 0" class="empty">
        <p>Todavía no hay categorías. La persona anfitriona puede crear la primera desde el panel de anfitrión.</p>
        <small v-if="!isAdmin" class="hint">Toca "Soy la persona anfitriona" arriba si te toca crear los premios.</small>
      </div>
      <div v-else>
      <AppCategoryCard v-for="(cat, i) in categories" :key="cat.id"  :name="cat.name" :cat-num="i + 1" :cat-nominees-length="cat.nominees.length" :votes="cat.total" :status="cat.status" :winner="winnerFor(cat)?.name" @click="openDetail(cat.id)" />
      </div>
    </div>
  </template>
</template>
