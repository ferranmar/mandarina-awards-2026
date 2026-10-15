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
  try { await resetCategoryVotes(cat) } catch { }
}
async function removeCategory(cat: Category) {
  try { await deleteCategory(cat) } catch { }
}
</script>

<template>
  <div class="page-content">
    <AdminBox v-if="!isAdmin" v-model="adminPassword" :admin-error="adminError" @login-admin="handleLogin" />
    <template v-else>
      <button class="link-btn" @click="handleLogout">Cerrar sesión</button>
      <div class="list-wrap">
        <AdminNewCategoryForm v-model="categoryForm" :category-form-error="categoryFormError"
          @add-nominee-field="addNomineeField" @submit-category="submitCategory" />
        <AdminCategoryList :categories="categories" @toggle-status="toggleStatus" @delete-category="removeCategory"
          @reset-votes="resetVotes" />
      </div>
    </template>
  </div>
</template>