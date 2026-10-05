<script setup lang="ts">
const { init, closeConnection, submitName, connected, voterName } = useVoting()

const nameInput = ref('')
const nameError = ref('')

onMounted(() => { init() })
onBeforeUnmount(() => { closeConnection() })

async function handleSubmitName() {
  const name = nameInput.value.trim()
  if (!name) { nameError.value = 'Escribe tu nombre'; return }
  try {
    submitName(name)
    nameError.value = ''
  } catch (e: any) {
    nameError.value = e?.data?.statusMessage || 'No se pudo registrar'
  }
}

</script>

<template>
  <div class="page-wrap">
    <AppHeader />
    <AppHero />
    <div class="eyebrow">
      <span class="dot" />
      <span :class="['conn-status', { live: connected }]">{{ connected ? 'En vivo' : 'Conectando…' }}</span>
    </div>
    <NameGate v-if="!voterName" v-model="nameInput" :name-error="nameError" @submit-name="handleSubmitName" />
    <template v-else>
      <NuxtPage />
    </template>
  </div>
</template>
