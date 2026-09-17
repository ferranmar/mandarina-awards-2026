<script setup lang="ts">

const categoryForm = defineModel<{ catName: string, catNominees: string[] }>({ required: true })
const props = defineProps<{ categoryFormError: string }>()

const emit = defineEmits<{addNomineeField: [], submitCategory: []}>()

</script>


<template>
    <div class="admin-box">
        <h3>Nueva categoría</h3>
        <input v-model="categoryForm.catName" type="text" placeholder="Nombre de la categoría, ej. Mejor anfitrión de fiestas">
        <div style="margin-top:10px;">
            <div v-for="(n, i) in categoryForm.catNominees" :key="i" class="nominee-input-row">
                <input v-model="categoryForm.catNominees[i]" type="text" placeholder="Nombre del nominado">
            </div>
        </div>
        <p v-if="props.categoryFormError" class="error-msg">{{ props.categoryFormError }}</p>
        <div class="row">
            <button class="btn secondary" @click="emit('addNomineeField')">+ Nominado</button>
            <button class="btn" @click="emit('submitCategory')">Agregar categoría</button>
        </div>
    </div>
</template>
