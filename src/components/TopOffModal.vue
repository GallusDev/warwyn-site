<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h3>You are purchasing: Wyncoins using STRIPE</h3>
      <form @submit.prevent="submitPurchase">
        <label>
          Amount:
          <input type="number" v-model.number="amount" min="500" max="50000" />
        </label>

        <p class="price">Price: ${{ (amount * unitPrice / 100).toFixed(2) }}</p>
        <p class="limits">MIN. PURCHASE: 500 | MAX. PURCHASE: 50,000</p>

        <label class="terms">
          <input type="checkbox" v-model="agreed" />
          I agree to the terms and understand that I purchase at my own risk.
        </label>

        <div class="modal-actions">
          <button type="button" class="cancel" @click="$emit('close')">Cancel</button>
          <button type="submit" class="purchase" :disabled="!agreed || amount < 500 || amount > 50000">Purchase</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean
  },
  data() {
    return {
      amount: 0,
      agreed: false,
      unitPrice: 1 // 1 cent per coin (adjust as needed)
    };
  },
  methods: {
    submitPurchase() {
      if (!this.agreed || this.amount < 500 || this.amount > 50000) return;
      this.$emit('topoff', this.amount);
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #1e1e1e;
  padding: 2rem;
  border-radius: 10px;
  width: 400px;
  color: white;
}
input[type="number"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  background: #2c2c2c;
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
}
.terms {
  margin-top: 10px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px; /* Ensures spacing between checkbox and text */
}

.terms input {
  max-width: 20px;
  margin: 0;
}
.price, .limits {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #ccc;
}
.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
.cancel, .purchase {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.cancel {
  background: transparent;
  color: #aaa;
  border: 1px solid #555;
}
.purchase {
  background: #7b2cf5;
  color: white;
}
.purchase:disabled {
  background: #555;
  cursor: not-allowed;
}
</style>