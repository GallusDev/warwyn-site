<template>
  <div class="dashboard-wrapper">
  <div class="account-settings">
      <h2>Account Settings</h2>
      <form @submit.prevent="updateSettings">
        <div class="form-group">
          <label for="email"><strong>Email:</strong></label>
          <input v-model="email" type="email" id="email" placeholder="Enter your email here" required/>
        </div>

        <div class="form-group">
          <label for="password"><strong>New Password:</strong></label>
          <input v-model="password" type="password" id="password" placeholder="Leave blank to keep current"/>
        </div>

        <button type="submit">Save Changes</button>

        <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </form>
  </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch} from 'vue'
import {useUserStore} from '../../stores/user'

const userStore = useUserStore()
const email = ref('')
const password = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const props = defineProps({
  userData: Object,
  hiscoresData: Object
})

const displayUsername = ref('')

watch(
    () => props.userData?.username,
    async (newUsername) => {
      if (!newUsername) return
      displayUsername.value = newUsername.toLowerCase()

      try {
        const res = await fetch(`http://localhost:3000/api/users/${displayUsername.value}`)
        const data = await res.json()
        email.value = data.email
      } catch (err) {
        errorMessage.value = 'Failed to load user data.'
      }
    },
    {immediate: true}
)

const updateSettings = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/users/${displayUsername.value}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: email.value,
        ...(password.value && {password: password.value})
      })
    })

    if (!res.ok) throw new Error('Failed to update settings.')

    successMessage.value = 'Settings updated successfully!'
    errorMessage.value = ''
    password.value = ''
  } catch (err) {
    errorMessage.value = err.message
    successMessage.value = ''
  }
}
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  justify-content: center;
  padding: 0 2rem 2rem;
}

.account-settings {
  max-width: 960px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
}

h2 {
  margin-bottom: 1.5rem;
  color: var(--accent);
}

.form-group {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.6), rgba(50, 50, 50, 0.4));
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 1 1 30%;
  min-width: 200px;
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.05), 0 6px 16px rgba(0, 0, 0, 0.3);
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-light);
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-darker);
  color: var(--text-light);
}

button {
  background-color: var(--accent);
  color: var(--on-accent, #000);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: var(--accent-hover);
}

.success-msg {
  margin-top: 1rem;
  color: #6fcf97;
}

.error-msg {
  margin-top: 1rem;
  color: #e57373;
}
</style>