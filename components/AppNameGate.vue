<script setup lang="ts">
const nameInput = defineModel<string>({ required: true })
const nameError = ref('')
const voterName = useState('voterName', () => '')

async function submitName() {
  const name = nameInput.value.trim()
  if (!name) { nameError.value = 'Escribe tu nombre'; return }
  try {
    const res = await $fetch<{ name: string }>('/api/register', { method: 'POST', body: { name } })
    voterName.value = res.name
    nameError.value = ''
  } catch (e: any) {
    nameError.value = e?.data?.statusMessage || 'No se pudo registrar'
  }
}

</script>

<template>
  <div class="name-gate">
    <h2>¿Cómo te llamas?</h2>
    <p>Así sabremos que ya votaste en cada categoría.</p>
    <input type="text" v-model="nameInput" placeholder="Tu nombre" @keydown.enter="submitName">
    <p v-if="nameError" class="error-msg">{{ nameError }}</p>
    <div class="row">
      <button class="btn" @click="submitName">Entrar a la ceremonia</button>
    </div>
  </div>
</template>