<template>
  <div class="promptpay-modal-content p-6 text-center">
    <h2 class="text-xl font-bold mb-4">Scan to Pay with PromptPay</h2>
    
    <div v-if="qrPayload" class="qr-container my-4">
      <vue-qrcode 
        :value="qrPayload" 
        :options="{ width: 220 }"
      ></vue-qrcode>
    </div>
    
    <p class="mb-2"><strong>Amount:</strong> <span class="text-green-600 font-bold">{{ amount.toFixed(2) }}</span> THB</p>
    <p class="text-sm text-gray-500 mb-6">Please scan the QR code with your banking app to complete the payment.</p>

    <button 
      @click="confirm"
      class="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition"
    >
      I Have Paid
    </button>
  </div>
</template>

<script>
import { generatePayload } from 'promptpay-qr';
import VueQrcode from 'vue-qrcode';

export default {
  name: 'PromptPay',
  components: {
    VueQrcode,
  },
  props: {
    amount: {
      type: Number,
      required: true,
    },
    bookingId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      // IMPORTANT: Replace with your actual PromptPay number (phone or National ID)
      promptPayId: '0812345678', 
      qrPayload: null
    };
  },
  created() {
    this.generateQR();
  },
  methods: {
    generateQR() {
      if (this.amount > 0) {
        this.qrPayload = generatePayload(this.promptPayId, { amount: this.amount });
      }
    },
    confirm() {
      // Emit an event to the parent component to handle the confirmation logic
      this.$emit('payment-confirmed', this.bookingId);
    }
  },
  watch: {
    amount() {
      // Re-generate QR code if amount changes
      this.generateQR();
    }
  }
};
</script>

<style scoped>
.promptpay-modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  max-width: 400px;
  margin: auto;
}
.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
</style>
