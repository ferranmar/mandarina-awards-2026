<script setup lang="ts">
const { isAdmin, categories, createCategory, toggleCategoryStatus, resetCategoryVotes, deleteCategory, loginAdmin, logoutAdmin } = useVoting()

const adminPassword = ref('')
const adminError = ref('')

async function handleLogin() {
  adminError.value = ''
  try {
    await loginAdmin(adminPassword.value)
    adminPassword.value = ''
  } catch (e: any) {
    adminError.value = e?.data?.statusMessage || 'Contraseña incorrecta'
  }
}

async function handleLogout() {
  await logoutAdmin()
}

const categoryForm = ref({ catName: '', catNominees: ['', ''] })
const categoryFormError = ref('')

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
    await createCategory(name, nominees)
    categoryForm.value.catName = ''
    categoryForm.value.catNominees = ['', '']
  } catch (e: any) {
    categoryFormError.value = e?.data?.statusMessage || 'No se pudo crear la categoría'
  }
}

async function toggleStatus(cat: Category) {
  try { await toggleCategoryStatus(cat) } catch { }
}
async function resetVotes(cat: Category) {
  if (!confirm('¿Borrar todos los votos de esta categoría?')) return
  try { await resetCategoryVotes(cat) } catch { }
}
async function removeCategory(cat: Category) {
  if (!confirm('¿Eliminar esta categoría por completo?')) return
  try { await deleteCategory(cat) } catch { }
}
</script>

<template>
  <div class="page">
    <AdminBox v-if="!isAdmin" v-model="adminPassword" :admin-error="adminError" @login-admin="handleLogin" />

    <template v-else>
      <div class="admin-header">
        <button class="link-btn" @click="handleLogout">Cerrar sesión</button>
      </div>
      <AdminNewCategoryForm v-model="categoryForm" :category-form-error="categoryFormError"
        @add-nominee-field="addNomineeField" @submit-category="submitCategory" />
      <AdminCategoryList :categories="categories" @toggle-status="toggleStatus" @delete-category="removeCategory"
        @reset-votes="resetVotes" />
    </template>
  </div>
</template>