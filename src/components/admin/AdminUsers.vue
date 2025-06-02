<template>
  <div class="admin-users">
    <h2>Users</h2>
    <div v-if="loading" class="loading">Loading users...</div>
    <table v-else class="user-table">
      <thead>
      <tr>
        <th>Username</th>
        <th>Email</th>
        <th>User Rights</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in users" :key="user.uid">
        <td>{{ user.username.replace(/\b\w/g, l => l.toUpperCase()) }}</td>
        <td>{{ user.email }}</td>
        <td>{{ getRightsLabel(user.user_rights) }}</td>
        <td>
          <router-link :to="`/admin/manage/${user.username}`">
            <button>Manage ⚙</button>
          </router-link>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const db = getFirestore()
const router = useRouter()
const users = ref([])
const loading = ref(true)

const fetchUsers = async () => {
  loading.value = true
  const snapshot = await getDocs(collection(db, 'users'))
  users.value = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
  loading.value = false
}

const getRightsLabel = val => ['Player', 'Mod', 'Admin', 'Owner'][val] || 'Unknown'
const goToManage = user => router.push({ name: 'AdminManageUser', params: { username: user.username } })

onMounted(fetchUsers)
</script>

<style scoped>
.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.user-table th {
  background-color: #1f1f1f;
  color: #fff;
}
.user-table th,
.user-table td {
  border: 1px solid #333;
  padding: 0.75rem;
  text-align: left;
}
button {
  margin: 0.25rem 0;
  padding: 0.5rem;
  background-color: #444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #666;
}
.icon {
  margin-left: 5px;
}
</style>