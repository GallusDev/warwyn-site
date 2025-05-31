<template>
  <div class="container">
    <div class="header">
      <h2>Shop Items</h2>
      <button @click="openNewItemModal">+ New Item</button>
    </div>

    <div v-if="loading">Loading shop items...</div>
    <div v-else class="shop-grid">
      <div v-for="item in shopItems" :key="item.id" class="shop-card">
        <img :src="item.image" alt="item image" />
        <h3>{{ item.name }}</h3>
        <p>{{ item.description }}</p>
        <p>Price: {{ item.price }} WC</p>
        <p>Item ID: {{ item.itemId }}</p>
        <p>Status: <span :class="{ enabled: item.enabled, disabled: !item.enabled }">{{ item.enabled ? 'Enabled' : 'Disabled' }}</span></p>
        <p v-if="item.limitedTime">Removed On: {{ formatDate(item.removalDate) }}</p>
        <p v-if="item.limitedQuantity">Remaining: {{ item.quantity }}</p>
        <button @click="editItem(item)">Edit</button>
        <button @click="deleteItem(item.id)">Delete</button>
      </div>
    </div>

    <EditShopItemModal :visible="modals.edit" :itemData="selectedItem" @close="closeModal" @save="updateItem" />
    <NewShopItemModal :visible="modals.new" @close="closeModal" @submit="createNewItem" />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { addDoc, updateDoc, deleteDoc, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.js';
import EditShopItemModal from './EditShopItemModal.vue';
import NewShopItemModal from './NewShopItemModal.vue';

export default {
  components: { EditShopItemModal, NewShopItemModal },
  setup() {
    const shopItems = ref([]);
    const loading = ref(true);
    const modals = ref({ edit: false, new: false });
    const selectedItem = ref(null);

    const fetchShopItems = async () => {
      loading.value = true;
      const querySnapshot = await getDocs(collection(db, 'shop'));
      shopItems.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loading.value = false;
    };

    const createNewItem = async (newItem) => {
      try {
        await addDoc(collection(db, 'shop'), newItem);
        closeModal();
      } catch (e) {
        console.error('Failed to create item:', e);
      }
    }

    const updateItem = async (updatedItem) => {
      try {
        const { id, ...fields } = updatedItem;
        const docRef = doc(db, 'shop', id);
        await updateDoc(docRef, fields);
        closeModal();
      } catch (e) {
        console.error('Failed to update item:', e);
      }
    };

    const editItem = (item) => {
      selectedItem.value = item;
      modals.value.edit = true;
    };

    const deleteItem = async (itemId) => {
      if (!confirm("Are you sure you want to delete this item?")) return;
      try {
        const docRef = doc(db, 'shop', itemId);
        await deleteDoc(docRef);
        await fetchShopItems();
      } catch (e) {
        console.error('Failed to delete item:', e);
      }
    };

    const openNewItemModal = () => {
      modals.value.new = true;
    };

    const closeModal = () => {
      modals.value = { edit: false, new: false };
      selectedItem.value = null;
      fetchShopItems();
    };

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date.seconds * 1000).toLocaleString();
    };

    onMounted(fetchShopItems);

    return {
      shopItems, loading, modals,
      selectedItem, createNewItem,
      updateItem, editItem, deleteItem,
      openNewItemModal, closeModal, formatDate
    };
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.shop-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.shop-card {
  background: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  width: 200px;
  text-align: center;
}
.shop-card img {
  width: 80px;
  height: 80px;
}
.shop-card button {
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.25rem;
}
.shop-card button:last-of-type {
  background-color: #822;
}
.shop-card button:last-of-type:hover {
  background-color: #a33;
}
.enabled { color: green; }
.disabled { color: red; }
</style>