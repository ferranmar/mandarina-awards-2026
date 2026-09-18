<script setup lang="ts">
const props = defineProps<{ voterName: string, isAdmin: boolean }>()
const view = defineModel<'admin' | 'list' | 'detail'>({ required: true })
const emit = defineEmits<{ toggleAdminLogin: [], logoutAdmin: [] }>()

function toggleView() {
	view.value = view.value === 'admin' ? 'list' : 'admin'
}
</script>


<template>
	<div class="topbar">
		<span>Votando como <b>{{ props.voterName }}</b></span>
		<span>
			<button v-if="props.isAdmin" class="link-btn" @click="toggleView">
				{{ view === 'admin' ? 'Ver programa' : 'Panel de anfitrión' }}
			</button>
			<button v-if="props.isAdmin" class="link-btn" @click="emit('logoutAdmin')">Cerrar sesión de anfitrión</button>
			<button v-else class="link-btn" @click="emit('toggleAdminLogin')">Soy la persona anfitriona</button>
		</span>
	</div>
</template>
