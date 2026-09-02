<template>
  <div class="mock-payment-container p-8 text-center">
    <h1 class="text-2xl font-bold mb-4">หน้าจำลองการชำระเงิน</h1>
    <p class="mb-6">นี่คือหน้าจำลองของผู้ให้บริการชำระเงิน (เช่น Stripe, Omise)</p>

    <div class="card p-6 border rounded shadow-lg max-w-md mx-auto">
      <h2 class="text-xl font-semibold mb-2">คำสั่งซื้อ #{{ bookingId }}</h2>
      <p class="mb-4">
        ช่องทางการชำระเงิน: <span class="font-semibold">{{ paymentMethod }}</span>
      </p>
      
      <div v-if="paymentMethod === 'promptpay'" class="mb-4">
        <p>กรุณาสแกน QR Code ด้านล่างเพื่อชำระเงิน</p>
        <!-- You could generate a real or mock QR code here -->
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com/promptpay-mock" alt="Mock QR Code" class="mx-auto my-4 border" />
      </div>

      <div v-else-if="paymentMethod === 'credit-card'" class="mb-4 text-left">
        <label class="block mb-1">ชื่อบนบัตร</label>
        <input type="text" value="John Doe" class="border p-2 w-full rounded mb-2" disabled />
        <label class="block mb-1">หมายเลขบัตร</label>
        <input type="text" value="**** **** **** 1234" class="border p-2 w-full rounded mb-2" disabled />
        <label class="block mb-1">วันหมดอายุ / CVC</label>
        <div class="flex gap-2">
            <input type="text" value="12/25" class="border p-2 w-full rounded" disabled />
            <input type="text" value="***" class="border p-2 w-full rounded" disabled />
        </div>
      </div>
      
      <p class="text-gray-500 text-sm mb-6">ข้อมูลถูกกรอกไว้เพื่อการสาธิตเท่านั้น</p>

      <button @click="confirmPayment" class="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition">
        คลิกเพื่อยืนยันการชำระเงิน (จำลอง)
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MockPayment',
  data() {
    return {
      bookingId: null,
      paymentMethod: null
    };
  },
  created() {
    // Extract info from query params
    this.bookingId = this.$route.query.bookingId || 'N/A';
    this.paymentMethod = this.$route.query.method || 'Unknown';
  },
  methods: {
    confirmPayment() {
      // On success, redirect to the final confirmation page
      // Pass the bookingId along to fetch final details
      this.$router.push({ 
        name: 'booking-confirmation', 
        query: { bookingId: this.bookingId } 
      });
    }
  }
};
</script>
