<script setup lang="ts">
const props = defineProps<{ adminError: string }>()
const adminPassword = defineModel<string>({ required: true })
const emit = defineEmits<{ loginAdmin: [] }>()
</script>

<template>
  <div class="admin-box">
    <h3>Acceso de anfitrión</h3>
    <input
      v-model="adminPassword" type="password" placeholder="Contraseña de anfitrión"
      @keydown.enter="emit('loginAdmin')">
    <p v-if="props.adminError" class="error-msg">{{ props.adminError }}</p>
    <div class="row">
      <button class="btn" @click="emit('loginAdmin')">Entrar</button>
    </div>
  </div>
</template>