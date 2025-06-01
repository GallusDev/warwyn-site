<template>
  <div class="admin-container">
    <h2 class="title">Purchase Logs</h2>

    <div v-if="loading" class="status">Loading purchase logs...</div>
    <div v-else-if="purchases.length === 0" class="status">No purchases found.</div>

    <table v-else class="log-table">
      <thead>
      <tr>
        <th>Username</th>
        <th>Item</th>
        <th>Item ID</th>
        <th>Price</th>
        <th>Date</th>
        <th>Claimed</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="purchase in purchases" :key="purchase.id">
        <td>{{ purchase.username.replace(/\b\w/g, l => l.toUpperCase()) }}</td>
        <td>{{ purchase.itemName }}</td>
        <td>{{ purchase.itemId }}</td>
        <td>{{ purchase.price }} WC</td>
        <td>{{ formatDate(purchase.timestamp) }}</td>
        <td>
            <span :class="purchase.claimed ? 'badge claimed' : 'badge unclaimed'">
              {{ purchase.claimed ? 'Yes' : 'No' }}
            </span>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore'

const db = getFirestore()

const purchases = ref([]);
const loading = ref(true);

const fetchPurchases = async () => {
  try {
    const q = query(collection(db, 'purchases'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    purchases.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Failed to fetch purchase logs:', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate();
  return date.toLocaleString();
};

onMounted(fetchPurchases);
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
  color: var(--text-light);
}

.title {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.status {
  padding: 1rem;
  font-size: 1.1rem;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.95rem;
}

.log-table th,
.log-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  text-align: left;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.85rem;
}

.claimed {
  background-color: #4caf50;
  color: white;
}

.unclaimed {
  background-color: #f44336;
  color: white;
}
</style>