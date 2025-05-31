<template>
  <EditShopItemModal
      :visible="visible"
      :itemData="defaultItem"
      :emit-directly="false"
      @close="$emit('close')"
      @save="handleSave"
  />
</template>

<script>
import EditShopItemModal from './EditShopItemModal.vue';

export default {
  components: { EditShopItemModal },
  props: {
    visible: Boolean
  },
  data() {
    return {
      defaultItem: {
        name: '',
        description: '',
        image: '',
        price: 0,
        itemId: 0,
        enabled: true,
        limitedTime: false,
        disableAt: '',
        limitedQuantity: false,
        maxQuantity: 0
      }
    };
  },
  methods: {
    handleSave(newItem) {
      this.$emit('save', newItem);
    }
  }
};
</script>
