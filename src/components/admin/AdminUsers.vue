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
        <td>{{ user.username }}</td>
        <td>{{ user.email }}</td>
        <td>{{ getRightsLabel(user.user_rights) }}</td>
        <td>
          <button @click="openRightsModal(user)">Manage Rights</button>
          <button @click="sendKick(user)">Kick</button>
          <button v-if="!user.muted" @click="openInfractionModal(user, 'mute')">Mute</button>
          <button v-else @click="unmuteUser(user)">Unmute</button>
          <button v-if="!user.banned" @click="openInfractionModal(user, 'ban')">Ban</button>
          <button v-else @click="unbanUser(user)">Unban</button>
          <button @click="openTeleportModal(user)">Teleport</button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- Manage Rights Modal -->
    <div v-if="modals.rights" class="modal">
      <div class="modal-content">
        <h3>Change Rights for {{ modals.user?.username }}</h3>
        <select v-model="selectedRights">
          <option value="0">Player</option>
          <option value="1">Player Moderator</option>
          <option value="2">Admin</option>
          <option value="3">Owner</option>
        </select>
        <button @click="updateRights">Confirm</button>
        <button @click="closeModals">Cancel</button>
      </div>
    </div>

    <!-- Infraction Modal -->
    <div v-if="modals.infraction" class="modal">
      <div class="modal-content">
        <h3>{{ infractionType === 'mute' ? 'Mute' : 'Ban' }} {{ modals.user?.username }}</h3>

        <label for="infraction-reason">Reason</label>
        <input id="infraction-reason" v-model="infractionReason" placeholder="Reason" />

        <label for="infraction-expiration">Expiration Date</label>
        <input id="infraction-expiration" type="date" v-model="infractionExpiration" />

        <button @click="submitInfraction">Submit</button>
        <button @click="closeModals">Cancel</button>
      </div>
    </div>

    <!-- Teleport Modal -->
    <div v-if="modals.teleport" class="modal">
      <div class="modal-content">
        <h3>Teleport {{ modals.user?.username }}</h3>

        <label for="teleport-x">X Coordinate</label>
        <input id="teleport-x" v-model.number="teleport.x" placeholder="X Coordinate" type="number" />

        <label for="teleport-y">Y Coordinate</label>
        <input id="teleport-y" v-model.number="teleport.y" placeholder="Y Coordinate" type="number" />

        <label for="teleport-z">Height (Z)</label>
        <input id="teleport-z" v-model.number="teleport.z" placeholder="Height (Z)" type="number" />

        <button @click="submitTeleport">Teleport</button>
        <button @click="closeModals">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore'

const db = getFirestore()
const users = ref([])
const loading = ref(true)
const modals = ref({ rights: false, infraction: false, teleport: false, user: null })
const selectedRights = ref(0)
const infractionType = ref('')
const infractionReason = ref('')
const infractionExpiration = ref('')
const teleport = ref({ x: 0, y: 0, z: 0 })

const fetchUsers = async () => {
  loading.value = true
  users.value = []
  const snapshot = await getDocs(collection(db, 'users'))
  snapshot.forEach(docSnap => {
    users.value.push({ uid: docSnap.id, ...docSnap.data() })
  })
  loading.value = false
}

const getRightsLabel = (val) => ['Player', 'Mod', 'Admin', 'Owner'][val] || 'Unknown'

const openRightsModal = (user) => {
  modals.value = { rights: true, infraction: false, teleport: false, user }
  selectedRights.value = user.user_rights
}

const updateRights = async () => {
  await updateDoc(doc(db, 'users', modals.value.user.username), { user_rights: +selectedRights.value })
  closeModals()
  fetchUsers()
}

const openInfractionModal = (user, type) => {
  modals.value = { rights: false, infraction: true, teleport: false, user }
  infractionType.value = type
  infractionReason.value = ''
  infractionExpiration.value = ''
}

const submitInfraction = async () => {
  const uid = modals.value.user.uid
  const username = modals.value.user.username
  const type = infractionType.value
  const reason = infractionReason.value
  const expiration = infractionExpiration.value

  const updateField = type === 'mute' ? { muted: true } : { banned: true }
  await updateDoc(doc(db, 'users', username), updateField)

  await addDoc(collection(db, 'infractions'), {
    user: uid,
    type,
    reason,
    expiration,
    rule: null
  })

  try {
    const endpoint = type === 'mute' ? '/mute' : '/kick';
    const body = type === 'mute' ? { username, muted: true } : { username };
    await fetch(`http://localhost:4567${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error(`Failed to notify game server of ${type}:`, error);
  }

  closeModals()
  fetchUsers()
}

const unmuteUser = async (user) => {
  await updateDoc(doc(db, 'users', user.uid), { muted: false })
  try {
    await fetch('http://localhost:4567/mute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, muted: false })
    })
  } catch (err) {
    console.error('Failed to unmute user:', err)
  }
  fetchUsers()
}

const unbanUser = async (user) => {
  await updateDoc(doc(db, 'users', user.uid), { banned: false })
  fetchUsers()
}

const openTeleportModal = (user) => {
  modals.value = { rights: false, infraction: false, teleport: true, user }
  teleport.value = { x: 0, y: 0, z: 0 }
}

const submitTeleport = async () => {
  await fetch('http://localhost:4567/teleport', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: modals.value.user.username,
      ...teleport.value
    })
  })
  closeModals()
}

const sendKick = async (user) => {
  try {
    await fetch('http://localhost:4567/kick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username })
    })
  } catch (err) {
    console.error('Failed to send kick:', err)
  }
}

const closeModals = () => {
  modals.value = { rights: false, infraction: false, teleport: false, user: null }
}

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
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
}
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #1f1f1f;
  padding: 2rem;
  border-radius: 8px;
  color: #fff;
  width: 400px;
  max-width: 90%;
}
.modal-content input,
.modal-content select {
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #2c2c2c;
  border: 1px solid #444;
  color: #fff;
}
</style>