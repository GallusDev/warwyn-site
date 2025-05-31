<template>
  <div class="admin-home">
    <h2>Welcome, Administrator!</h2>

    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <h3>{{ stat.label }}</h3>
        <p>{{ stat.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'


const stats = ref([
  { label: 'Total Registered Players', value: 'Loading...' },
  { label: 'Online Right Now', value: 'Loading...' },
  { label: 'Unclaimed Shop Rewards', value: 'Loading...' },
  { label: 'Active Staff Accounts', value: 'Loading...' }
])

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/admin/stats', { credentials: 'include' })
    const data = await res.json()

    stats.value = [
      { label: 'Total Registered Players', value: data.totalPlayers ?? 'N/A' },
      { label: 'Online Right Now', value: data.onlinePlayers ?? 'N/A' },
      { label: 'Unclaimed Shop Rewards', value: data.unclaimedRewards ?? 'N/A' },
      { label: 'Active Staff Accounts', value: data.staffAccounts ?? 'N/A' }
    ]
  } catch (err) {
    console.error('Failed to load admin stats', err)
  }
})
</script>

<style scoped>
.admin-home {
  padding: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  background: var(--bg-darker);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
}

.stat-card h3 {
  margin-bottom: 0.5rem;
  color: var(--accent);
}
</style>