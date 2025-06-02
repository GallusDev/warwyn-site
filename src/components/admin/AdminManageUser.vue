<template>
  <div class="manage-user">
    <router-link :to="`/admin/users`" class="back-link">
      <font-awesome-icon :icon="['fas', 'chevron-left']" /> Back to Users
    </router-link>
    <h2>Manage {{ username.replace(/\b\w/g, l => l.toUpperCase()) }}</h2>

    <div v-if="loading">Loading user...</div>
    <div v-else-if="!user">User not found.</div>
    <div v-else class="controls">
      <div class="field">
        <label>Email:</label>
        <span>{{ user.email }}</span>
      </div>

      <div class="field">
        <label>User Rights:</label>
        <select v-model="rights">
          <option value="0">Player</option>
          <option value="1">Player Moderator</option>
          <option value="2">Admin</option>
          <option value="3">Owner</option>
        </select>
        <button class="small-btn" @click="updateRights">Update</button>
      </div>

      <div class="field">
        <label>Muted:</label>
        <span>{{ user.muted ? 'Yes' : 'No' }}</span>
        <button class="small-btn" @click="toggleMute">{{ user.muted ? 'Unmute' : 'Mute' }}</button>
      </div>

      <div class="field">
        <label>Banned:</label>
        <span>{{ user.banned ? 'Yes' : 'No' }}</span>
        <button class="small-btn" @click="toggleBan">{{ user.banned ? 'Unban' : 'Ban' }}</button>
      </div>

      <div class="field">
        <label>Kick:</label>
        <button class="small-btn" @click="kickUser">Kick from Game</button>
      </div>

      <div class="teleport">
        <h3>Teleport User</h3>
        <div class="teleport-inputs">
          <label>
            X:
            <input type="number" v-model.number="teleport.x" min="0" step="1" />
          </label>
          <label>
            Y:
            <input type="number" v-model.number="teleport.y" min="0" step="1" />
          </label>
          <label>
            Height:
            <input type="number" v-model.number="teleport.z" min="0" step="1" />
          </label>
          <button class="small-btn" @click="teleportUser">Teleport</button>
        </div>
      </div>
    </div>

    <div v-if="message" :class="['toast', messageType]">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const db = getFirestore()
const route = useRoute()
const username = route.params.username
const message = ref('')
const messageType = ref(''); // 'success' or 'error'

const user = ref(null)
const loading = ref(true)
const rights = ref(0)
const teleport = ref({ x: 0, y: 0, z: 0 } )

const fetchUser = async () => {
  try {
    const snap = await getDoc(doc(db, 'users', username))
    if (snap.exists()) {
      user.value = snap.data()
      rights.value = user.value.user_rights
    }
  } catch (err) {
    console.error('Failed to fetch user:', err)
  } finally {
    loading.value = false
  }
}

const updateRights = async () => {
  const currentRights = user.value.user_rights;
  const newRights = +rights.value;

  if (newRights === currentRights) {
    showMessage('This user already has this rank.', 'error');
    return;
  }

  const prompt = newRights > currentRights ? "promoted" : "demoted";

  try {
    // Update in Firestore
    await updateDoc(doc(db, 'users', username), { user_rights: +rights.value });

    // Notify game server
    await fetch('http://localhost:4567/rank_change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        rights: newRights,
        prompt: prompt
      })
    });

    showMessage('User rights updated successfully.');
    await fetchUser();
  } catch (err) {
    console.error('Failed to update rights or notify game server:', err);
    showMessage('Failed to update user rights.', 'error');
  }
};

const toggleMute = async () => {
  const muted = !user.value.muted
  await updateDoc(doc(db, 'users', username), { muted })
  await fetch(`http://localhost:4567/mute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, muted })
  })
  await fetchUser()
}

const toggleBan = async () => {
  const banned = !user.value.banned
  await updateDoc(doc(db, 'users', username), { banned })
  if (banned) {
    kickUser();
  }
  await fetchUser()
}

const kickUser = async () => {
  await fetch(`http://localhost:4567/kick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
}

const teleportUser = async () => {
  const { x, y, z } = teleport.value;

  if (x < 0 || y < 0 || z < 0) {
    showMessage('Coordinates must be 0 or greater.', 'error');
    return;
  }
  try {
    await fetch(`http://localhost:4567/teleport`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, ...teleport.value})
    });

    showMessage('User teleported.')
    teleport.value = {x: 0, y: 0, z: 0}
  } catch (err) {
    showMessage('Teleport failed.', 'error');
    console.error(err);
  }
}

const showMessage = (msg, type = 'success') => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
    messageType.value = '';
  }, 3000);
}

onMounted(fetchUser)
</script>

<style scoped>
.manage-user {
  max-width: 700px;
  margin: auto;
  padding: 2rem;
  color: #eee;
}

.controls .field {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.controls label {
  min-width: 100px;
  font-weight: bold;
}

.controls select {
  width: 20ch;
  padding: 0.3rem;
  background: #2c2c2c;
  border: 1px solid #444;
  color: #fff;
}

.small-btn {
  padding: 0.4rem 0.7rem;
  background: #444;
  color: #fff;
  border: none;
  border-radius: 5px;
  transition: 0.2s;
}

.small-btn:hover {
  background: #666;
  cursor: pointer;
}

.teleport {
  margin-top: 2rem;
}

.teleport-inputs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.teleport-inputs label {
  display: flex;
  flex-riection: column;
  font-weight: bold;
  gap: 0.75rem;
}

.teleport-inputs input {
  width: 8ch;
  padding: 0.3rem;
  text-align: left;
  background: #2c2c2c;
  border: 1px solid #444;
  color: #fff;
}

.toast {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  padding: 0.75rem 1.5rem;
  color: #fff;
  boder-radius: 6px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  animation: fadein 0.2s ease-out;
  z-index: 1000;
}

.toast.success {
  background-color: #2e7d32;
  color: white;
}

.toast.error {
  background-color: #c62828;
  color: white;
}

@keyframes fadein {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

input {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.4rem;
}
button {
  margin-left: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>