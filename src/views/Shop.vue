<template>
  <div class="container">
    <div class="shop">
      <div class="shop-header">
        <h2>Warwyn Store</h2>
        <div class="balance-box">
          <span>Balance: {{ balance.toLocaleString() }} <img :src="wyncoinIcon" alt="Wyncoins" class="icon"/></span>
          <button @click="showTopoff = true">Top Off</button>
        </div>
      </div>

      <div v-if="loading">Loading store...</div>
      <div v-else class="shop-grid">
        <div v-for="item in shopItems" :key="item.id" class="shop-card">
          <img :src="item.image" alt="item image"/>
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <p><strong>{{ item.price }} WC</strong></p>
          <button @click="buy(item)">Buy</button>
        </div>
      </div>
      <TopOffModal :visible="showTopoff" @close="showTopoff = false" @topoff="handleTopoff"/>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {collection, getDocs, getDoc, doc, onSnapshot} from 'firebase/firestore';
import {db, auth} from '../firebase.js';

import TopOffModal from "../components/TopOffModal.vue";

let authData = ref({});
const showTopoff = ref(false);
const shopItems = ref([]);
const loading = ref(true);
const balance = ref(0);
const wyncoinIcon = 'https://cdn-icons-png.flaticon.com/512/8810/8810527.png'

const handleTopoff = async (amount) => {
  showTopoff.value = false;
  const priceInCents = Math.round((amount / 100) * 100); // 100 wyncoins = $1 => price in cents

  try {
    const res = await fetch('http://localhost:3000/api/shop/create-checkout-session', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'Wyncoins',
        description: `${amount} Wyncoins - In-game currency used to buy items from the Warwyn donation shop.`,
        image: 'https://cdn-icons-png.flaticon.com/512/8810/8810527.png',
        price: priceInCents,
        amount: amount,
        userId: authData.value.username.toLowerCase()
      })
    });

    const data = await res.json();
    if (!data.url) throw new Error("No URL returned from Stripe");
    window.location.href = data.url;
  } catch (err) {
    console.error("Error during checkout:", err);
    alert("Something went wrong while initiating the transaction.");
  }
};

const fetchShopItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'shop'));
    shopItems.value = querySnapshot.docs
        .map(doc => ({id: doc.id, ...doc.data()}))
        .filter(item => item.enabled !== false);
  } catch (e) {
    console.error('Failed to fetch shop items:', e);
  } finally {
    loading.value = false;
  }
};

const buy = async (item) => {
  const cBal = balance.value;
  const price = item.price;
  const username = authData.value.username;

  if (cBal < price) {
    alert(`You don't have enough Wyncoins to purchase this.\nTry topping off!`);
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/shop/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: username,
        itemId: item.id,
        igId: item.itemId,
        itemName: item.name,
        price: price
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unknown error');

    alert(`You successfully purchased ${item.name}!`);
  } catch (err) {
    console.error("Error during purchase:", err);
    alert("Purchase failed: " + err.message);
  }
};

// On page load or useEffect-like block
onMounted(async () => {
  fetchShopItems(); // initial fetch for fallback

  // Subscribe to real-time updates on "shop"
  const shopCollection = collection(db, 'shop');
  onSnapshot(shopCollection, (snapshot) => {
    shopItems.value = snapshot.docs
        .map(doc => ({id: doc.id, ...doc.data()}))
        .filter(item => item.enabled !== false);
  })

  try {
    const authRes = await fetch('http://localhost:3000/auth/verify', {
      credentials: 'include'
    });
    if (!authRes.ok) throw new Error('Not logged in');

    authData.value = await authRes.json();
    // assume authData.username is the actual username string
    const usernameLower = authData.value.username.toLowerCase();

    // Now listen on 'users/{usernameLower}'
    const userDocRef = doc(db, 'users', usernameLower);
    onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        balance.value = docSnap.data().wyncoins || 0;
      } else {
        // If the user doc doesn't exist yet, show 0
        balance.value = 0;
      }
    });
  } catch (err) {
    console.warn('User not logged in; skipping balance listener.');
  }

  const query = new URLSearchParams(window.location.search);
  if (query.has('canceled') && query.get('canceled') === true) {
    alert('Transaction canceled or failed. Please try again.');
  }
});
</script>

<style scoped>
.shop {
  padding: 20px;
  color: #fff;
}

.shop-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.shop-card {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 15px;
  width: 200px;
  text-align: center;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.shop-card img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.balance-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.balance-box span {
  font-weight: bold;
}

.balance-box button {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.icon {
  width: 25px;
  height: 25px;
  vertical-align: middle;
}
</style>