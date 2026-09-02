<template>
  <div class="checkout-container p-4">
    <h1 class="text-2xl font-bold mb-4">สรุปรายการจองและชำระเงิน</h1>

    <div v-if="field" class="card p-4 border rounded shadow-sm">
      <h2 class="text-xl font-semibold">{{ field.name }}</h2>
      <p><strong>วันที่:</strong> {{ new Date(selectedDate).toLocaleDateString() }}</p>
      <p><strong>เวลา:</strong> {{ selectedSlots.map(s => s.time).join(', ') }}</p>
      
      <div v-if="selectedEquipments && Object.keys(selectedEquipments).length > 0" class="mt-4">
        <strong>อุปกรณ์เสริม:</strong>
        <ul>
          <li v-for="(qty, id) in selectedEquipments" :key="id">
            - {{ getEquipmentName(id) }} (จำนวน: {{ qty }})
          </li>
        </ul>
      </div>

      <hr class="my-4" />

      <div class="text-right">
        <p class="font-bold text-lg">ยอดรวม: <span class="text-green-600">{{ grandTotal }} บาท</span></p>
      </div>

      <div class="payment-methods mt-6 text-center">
        <h3 class="font-semibold mb-4">เลือกช่องทางการชำระเงิน</h3>
        <button @click="initiatePayment('credit-card')" class="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 mr-2">
          ชำระด้วยบัตรเครดิต
        </button>
        <button @click="initiatePayment('promptpay')" class="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600">
          ชำระด้วย QR Code (PromptPay)
        </button>
      </div>
    </div>
    <div v-else class="text-center p-8">
      <p>ไม่พบข้อมูลการจอง กรุณากลับไปหน้าเลือกสนาม</p>
    </div>

    <!-- PromptPay Modal -->
    <div v-if="showPromptPayModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl p-4 max-w-sm w-full">
         <prompt-pay
          :amount="grandTotal"
          :booking-id="currentBookingId"
          @payment-confirmed="handlePaymentConfirmed"
        />
        <button @click="showPromptPayModal = false" class="mt-4 text-sm text-gray-600">ปิด</button>
      </div>
    </div>

  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useBookingStore } from '@/stores/booking';
import BookingService from '@/services/BookingService';
import PaymentService from '@/services/PaymentService';
import PromptPay from './PromptPay.vue';

export default {
  name: 'Checkout',
  components: {
    PromptPay
  },
  data() {
    return {
      showPromptPayModal: false,
      currentBookingId: null,
    };
  },
  computed: {
    ...mapState(useBookingStore, [
      'field',
      'selectedDate',
      'selectedSlots',
      'selectedEquipments',
      'equipmentDetails',
      'grandTotal'
    ]),
  },
  methods: {
    getEquipmentName(id) {
        const item = this.equipmentDetails.find(e => e.id == id);
        return item ? item.name : 'Unknown Equipment';
    },
    async initiatePayment(method) {
      if (!this.field) return;

      try {
        // 1. Create booking with 'pending-payment' status
        const bookingPayload = {
          fieldId: this.field.id,
          // A robust solution would calculate start/end times from slots
          startTime: this.selectedSlots[0].startTime,
          endTime: this.selectedSlots[this.selectedSlots.length - 1].endTime,
          totalPrice: this.grandTotal,
          status: 'pending-payment',
          equipmentItems: Object.entries(this.selectedEquipments)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => ({ equipmentId: parseInt(id), qty }))
        };

        const bookingRes = await BookingService.post(bookingPayload);
        this.currentBookingId = bookingRes.data.id;

        if (method === 'promptpay') {
          this.showPromptPayModal = true;
        } else {
          const paymentRes = await PaymentService.create({ bookingId: this.currentBookingId, method });
          window.location.href = paymentRes.data.paymentUrl.replace('https://pay.example.com/mockpay', '/mock-payment');
        }

      } catch (error) {
        console.error('Payment initiation failed:', error);
        alert('ไม่สามารถเริ่มการชำระเงินได้: ' + (error.response?.data?.error || error.message));
      }
    },
    async handlePaymentConfirmed(bookingId) {
      try {
        await BookingService.confirmPayment(bookingId);
        this.$router.push({ 
          name: 'booking-confirmation', 
          query: { bookingId: bookingId } 
        });
      } catch (error) {
        console.error('Payment confirmation failed:', error);
        alert('ไม่สามารถยืนยันการชำระเงินได้: ' + (error.response?.data?.error || error.message));
      }
    }
  }
};
</script>
