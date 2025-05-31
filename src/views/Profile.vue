<template>
  <div class="profile-dashboard">
    <div class="profile-nav">
      <button
          v-for="section in sections"
          :key="section"
          @click="activeSection = section"
          :class="{ active: activeSection === section }"
      >
        {{ section }}
      </button>
    </div>

    <div class="profile-content">
      <component
          v-if="userData && hiscoresData !== null"
          :is="componentMap[activeSection]"
          :userData="userData"
          :hiscoresData="hiscoresData"
      />
      <div v-else class="loading">Loading...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainDashboard from '../components/profile/MainDashboard.vue'
import AccountSettings from '../components/profile/AccountSettings.vue'
import AccountStatus from '../components/profile/AccountStatus.vue'

const router = useRouter()
const activeSection = ref('Dashboard')
const sections = ['Dashboard', 'Settings', 'Status']
const userData = ref(null)
const hiscoresData = ref(null)

const componentMap = {
  'Dashboard': MainDashboard,
  'Settings': AccountSettings,
  'Status': AccountStatus
}

onMounted(async () => {
  try {
    const authRes = await fetch('http://localhost:3000/auth/verify', {
      credentials: 'include'
    })

    if (!authRes.ok) throw new Error('Not logged in')

    const authData = await authRes.json()
    userData.value = authData

    const hiscoresRes = await fetch(`http://localhost:3000/api/hiscores/user/${authData.username}`)
    if (hiscoresRes.ok) {
      hiscoresData.value = await hiscoresRes.json()
      console.log(hiscoresData)
    } else {
      console.warn('Failed to fetch hiscores data')
    }
  } catch (err) {
    console.error('Access denied:', err)
    router.push({ path: '/login', query: { redirect: '/profile' } })
  }
})
</script>

<style scoped>
.profile-dashboard {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  align-items: center;
}

.profile-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border-color);
  width: 100%;
  max-width: 960px;
}

.profile-nav button {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-light);
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
  transition: border-color 0.3s ease, color 0.3s ease;
}

.profile-nav button.active {
  border-top: 3px solid var(--accent);
  border-bottom: 3px solid var(--accent);
  color: var(--accent);
  font-weight: bold;
}

.profile-content {
  width: 100%;
  max-width: 960px;
}
</style>