<script setup lang="ts">
const nameInput = defineModel<string>({ required: true })
const props = defineProps<{ nameError: string }>()
const emit = defineEmits<{ submitName: [] }>()
</script>

<template>
  <div class="name-gate">
    <h2>¿Cómo te llamas?</h2>
    <p>Así sabremos que ya votaste en cada categoría.</p>
    <input v-model="nameInput" type="text" placeholder="Tu nombre" @keydown.enter="emit('submitName')">
    <p v-if="props.nameError" class="error-msg">
      {{ props.nameError }}
    </p>
    <div class="row">
      <button class="btn" @click="emit('submitName')">
        Entrar a la ceremonia
      </button>
    </div>
  </div>
</template>