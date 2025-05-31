<template>
  <div v-if="visible" class="modal">
    <div class="modal-content">
      <h3>Edit Shop Item</h3>
      <form @submit.prevent="submitEdit">
        <label>Name:
          <input v-model="item.name" />
        </label>

        <label>Description:
          <textarea v-model="item.description"></textarea>
        </label>

        <label>Image URL:
          <input v-model="item.image" />
        </label>

        <label>Price:
          <input type="number" v-model.number="item.price" step="1" />
        </label>

        <label>Item ID:
          <input type="number" v-model.number="item.itemId" />
        </label>

        <label class="checkbox-label">
          Enabled
          <input type="checkbox" v-model="item.enabled" />
        </label>

        <label class="checkbox-label">
          Limited Time
          <input type="checkbox" v-model="item.limitedTime" />
        </label>

        <label v-if="item.limitedTime">Disable Date:
          <input type="datetime-local" v-model="item.disableAt" />
        </label>

        <label class="checkbox-label">
          Limited Quantity
          <input type="checkbox" v-model="item.limitedQuantity" />
        </label>

        <label v-if="item.limitedQuantity">Max Quantity:
          <input type="number" v-model.number="item.maxQuantity" />
        </label>

        <div class="modal-actions">
          <button type="submit">Save</button>
          <button type="button" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    itemData: Object,
    emitDirectly: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      item: { ...this.itemData }
    };
  },
  methods: {
    submitEdit() {
      if (this.emitDirectly) {
        this.$emit('save', this.item);
      } else {
        // emit to parent wrapper (NewShopItemModal)
        this.$emit('submit', this.item);
      }
    }
  },
  watch: {
    itemData(newData) {
      this.item = { ...newData };
    }
  }
};
</script>

<style scoped>
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
.modal-content select,
.modal-content textarea {
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #2c2c2c;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
.modal-content label {
  display: block;
}

.modal-content label.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}
</style>