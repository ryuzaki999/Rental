import { defineStore } from 'pinia';

export const useBookingStore = defineStore('booking', {
  state: () => ({
    field: null,
    selectedDate: null,
    selectedSlots: [],
    selectedEquipments: {},
    equipmentDetails: [], // To hold price info
  }),
  getters: {
    totalFieldPrice: (state) => {
      if (!state.selectedSlots) return 0;
      return state.selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    },
    totalEquipmentPrice: (state) => {
      if (!state.equipmentDetails.length || !Object.keys(state.selectedEquipments).length) return 0;
      
      return state.equipmentDetails.reduce((sum, item) => {
        const count = state.selectedEquipments[item.id] || 0;
        return sum + (item.price * count);
      }, 0);
    },
    grandTotal: (state, getters) => {
      return getters.totalFieldPrice + getters.totalEquipmentPrice;
    },
  },
  actions: {
    setBookingDetails({ field, date, slots, equipment, equipmentDetails, total }) {
      this.field = field;
      this.selectedDate = date;
      this.selectedSlots = slots;
      this.selectedEquipments = equipment;
      this.equipmentDetails = equipmentDetails;
    },
    clearBooking() {
      this.field = null;
      this.selectedDate = null;
      this.selectedSlots = [];
      this.selectedEquipments = {};
      this.equipmentDetails = [];
    },
    toggleSlot(slot) {
      const index = this.selectedSlots.findIndex(s => s.time === slot.time);
      if (index > -1) {
        this.selectedSlots.splice(index, 1);
      } else {
        this.selectedSlots.push(slot);
      }
    },
    updateEquipmentCount({ itemId, change }) {
      const current = this.selectedEquipments[itemId] || 0;
      const newValue = current + change;
      if (newValue >= 0) {
        this.selectedEquipments = {
          ...this.selectedEquipments,
          [itemId]: newValue,
        };
      }
    },
    setEquipmentDetails(equipments) {
        this.equipmentDetails = equipments;
    }
  },
});