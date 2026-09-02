<template>
  <div class="confirmation-container p-8 text-center">
    <div class="max-w-lg mx-auto bg-white p-10 rounded-lg shadow-xl">
      <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">การจองสำเร็จ!</h1>
      <p class="text-gray-600 mb-6">ขอบคุณที่ใช้บริการของเรา</p>

      <div class="text-left bg-gray-50 p-4 rounded-lg border">
        <h2 class="font-semibold mb-2">รายละเอียดการจอง</h2>
        <p><strong>หมายเลขการจอง:</strong> {{ bookingId }}</p>
        <p class="mt-1">เราได้ส่งอีเมลยืนยันพร้อมรายละเอียดการจองของคุณแล้ว (จำลอง)</p>
      </div>

      <div class="mt-8">
        <router-link to="/bookings" class="text-blue-600 hover:underline">
          ดูประวัติการจองทั้งหมด
        </router-link>
        <span class="mx-2">|</span>
        <router-link to="/fields" class="text-blue-600 hover:underline">
          กลับไปหน้าสนาม
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookingConfirmation',
  data() {
    return {
      bookingId: null
    };
  },
  created() {
    this.bookingId = this.$route.query.bookingId || 'N/A';
    // Here you could make a final API call to get confirmed booking details
    // For now, just displaying the ID is enough for the simulation.
  }
};
</script>
