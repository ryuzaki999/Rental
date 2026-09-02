<template>
  <div class="page-shell min-h-screen text-slate-900">
    <div v-if="loading" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="space-y-5">
        <div class="loading-block h-72 rounded-[2rem]"></div>
        <div class="loading-block h-10 w-2/3 rounded-xl"></div>
        <div class="loading-block h-32 rounded-2xl"></div>
      </div>
      <p class="mt-6 text-center text-lg text-slate-600">กำลังโหลดสนามที่คุณเลือก...</p>
    </div>

    <div v-if="!loading" class="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      <section class="hero-card reveal">
        <div class="grid grid-cols-1 gap-0 lg:grid-cols-5">
          <div class="relative h-[20rem] overflow-hidden lg:col-span-3 lg:h-[28rem]">
            <img :src="fieldThumbnailUrl" :alt="field.name" class="h-full w-full object-cover object-center" />
            <div class="absolute inset-0 bg-gradient-to-tr from-slate-950/75 via-slate-900/30 to-transparent"></div>
            <div class="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Featured Field
            </div>
            <div class="absolute bottom-6 left-6 right-6">
              <p class="inline-flex rounded-full bg-slate-950/50 px-3 py-1 text-xs font-medium text-emerald-200 backdrop-blur">
                {{ field.sportType || 'สนามกีฬา' }}
              </p>
              <h1 class="mt-3 text-3xl font-bold leading-tight text-white drop-shadow sm:text-4xl">
                {{ field.name }}
              </h1>
            </div>
          </div>

          <div class="hero-side lg:col-span-2">
            <div class="space-y-4">
              <div class="rounded-2xl bg-white/70 p-4 backdrop-blur">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Location</p>
                <p class="mt-1 text-base font-medium text-slate-800">{{ field.location || 'ไม่ระบุที่ตั้ง' }}</p>
              </div>
              <div class="rounded-2xl bg-white/70 p-4 backdrop-blur">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Rating</p>
                <p class="mt-1 text-base font-medium text-slate-800">{{ formatRating(field.ratingAvg) }} / 5.0</p>
                <p class="mt-0.5 text-sm text-slate-600">{{ reviews.length }} รีวิวจากผู้ใช้จริง</p>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div class="rounded-xl bg-slate-950 p-3 text-center text-emerald-300">
                  <p class="text-lg font-bold">{{ availableSlotsCount }}</p>
                  <p class="text-[10px] uppercase tracking-wider">ว่าง</p>
                </div>
                <div class="rounded-xl bg-slate-200 p-3 text-center text-slate-600">
                  <p class="text-lg font-bold">{{ occupiedSlotsCount }}</p>
                  <p class="text-[10px] uppercase tracking-wider">ไม่ว่าง</p>
                </div>
                <div class="rounded-xl bg-amber-100 p-3 text-center text-amber-700">
                  <p class="text-lg font-bold">{{ selectedSlots.length }}</p>
                  <p class="text-[10px] uppercase tracking-wider">เลือก</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="space-y-8 lg:col-span-2">
          <section class="panel reveal delay-1">
            <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p class="section-kicker">Step 1</p>
                <h2 class="text-2xl font-bold text-slate-900">เลือกวันที่และช่วงเวลา</h2>
                <p class="mt-1 text-sm text-slate-500">เลือกเฉพาะช่วงเวลาที่คุณต้องการใช้งานจริง</p>
              </div>
              <label class="w-full sm:max-w-[15rem]">
                <span class="mb-2 block text-sm font-semibold text-slate-700">วันที่จอง</span>
                <input
                  type="date"
                  v-model="selectedDate"
                  :min="todayDate"
                  @change="fetchSlots"
                  class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </label>
            </div>

            <div class="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              {{ selectedDateText }}
            </div>

            <div class="mb-5 flex flex-wrap gap-2 text-xs font-semibold sm:text-sm">
              <span class="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">ว่าง</span>
              <span class="rounded-full bg-slate-200 px-3 py-1 text-slate-600">ถูกจองแล้ว</span>
              <span class="rounded-full bg-amber-500 px-3 py-1 text-white">ที่คุณเลือก</span>
            </div>

            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              <button
                v-for="slot in slots"
                :key="slot.time"
                :disabled="!slot.available"
                @click="toggleSlot(slot)"
                :class="[
                  'group rounded-2xl border p-3 text-left transition duration-200 disabled:cursor-not-allowed disabled:opacity-70',
                  !slot.available
                    ? 'border-slate-200 bg-slate-100 text-slate-400'
                    : isSelected(slot)
                    ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200'
                    : 'border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50'
                ]"
              >
                <p class="text-sm font-semibold">{{ slot.time }}</p>
                <p class="mt-1 text-xs opacity-90">{{ slot.price.toLocaleString() }} บาท</p>
                <div class="mt-2 h-1.5 rounded-full bg-white/20">
                  <div
                    class="h-1.5 rounded-full bg-emerald-400 transition-all duration-200 group-hover:w-full"
                    :class="isSelected(slot) ? 'w-full bg-white' : 'w-1/3'"
                  ></div>
                </div>
              </button>
            </div>

            <p v-if="!slots.length" class="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              ไม่มีช่วงเวลาให้จองในวันที่เลือก
            </p>
          </section>

          <section class="panel reveal delay-2">
            <div class="mb-5">
              <p class="section-kicker">Step 2</p>
              <h2 class="text-2xl font-bold text-slate-900">เลือกอุปกรณ์เสริม</h2>
              <p class="mt-1 text-sm text-slate-500">เพิ่มอุปกรณ์ที่จำเป็นได้ทันทีจากหน้านี้</p>
            </div>

            <div v-if="equipments.length" class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                v-for="item in equipments"
                :key="item.id"
                class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/60"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-semibold text-slate-900">{{ item.name }}</p>
                    <p class="mt-1 text-sm text-slate-500">+{{ Number(item.price).toLocaleString() }} บาท / ชิ้น</p>
                  </div>
                  <div class="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {{ getEquipmentCount(item.id) }} ชิ้น
                  </div>
                </div>
                <div class="mt-3 flex items-center justify-end rounded-full bg-white shadow-inner">
                  <button
                    @click="updateEquipmentCount({ itemId: item.id, change: -1 })"
                    class="rounded-l-full px-4 py-2 text-lg font-bold text-slate-600 transition hover:bg-slate-100"
                    aria-label="ลดจำนวน"
                  >
                    -
                  </button>
                  <span class="mx-3 w-8 text-center text-sm font-semibold text-slate-700">{{ getEquipmentCount(item.id) }}</span>
                  <button
                    @click="updateEquipmentCount({ itemId: item.id, change: 1 })"
                    class="rounded-r-full px-4 py-2 text-lg font-bold text-slate-600 transition hover:bg-slate-100"
                    aria-label="เพิ่มจำนวน"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              สนามนี้ยังไม่มีอุปกรณ์ให้เช่า
            </p>
          </section>

          <section class="panel reveal delay-3">
            <h2 class="text-2xl font-bold text-slate-900">รีวิวจากผู้ใช้งาน</h2>

            <div class="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50/50 p-5 sm:p-6">
              <h3 class="text-lg font-semibold text-slate-800">เขียนรีวิวของคุณ</h3>
              <div class="mt-4">
                <label for="rating" class="mb-2 block text-sm font-medium text-slate-700">คะแนน</label>
                <select
                  v-model.number="newReview.rating"
                  id="rating"
                  class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  <option>5</option>
                  <option>4</option>
                  <option>3</option>
                  <option>2</option>
                  <option>1</option>
                </select>
              </div>
              <div class="mt-4">
                <label for="comment" class="mb-2 block text-sm font-medium text-slate-700">ความคิดเห็น</label>
                <textarea
                  v-model="newReview.comment"
                  id="comment"
                  rows="4"
                  class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder="แชร์ประสบการณ์การใช้งานสนามนี้"
                ></textarea>
              </div>
              <button
                @click="submitReview"
                class="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
              >
                ส่งรีวิว
              </button>
            </div>

            <div v-if="reviews.length" class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <article v-for="review in reviews" :key="review.id" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center">
                    <div class="mr-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-600">
                      {{ review.User?.name?.charAt(0) || '?' }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900">{{ review.User?.name || 'ผู้ใช้งาน' }} {{ review.User?.lastname || '' }}</p>
                      <p class="mt-0.5 text-xs text-slate-500">
                        {{ new Date(review.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'}) }}
                      </p>
                    </div>
                  </div>
                  <div class="text-base text-amber-500">
                    <span v-for="i in review.rating" :key="i">★</span>
                    <span class="text-slate-300" v-for="i in (5 - review.rating)" :key="i + review.rating">★</span>
                  </div>
                </div>
                <p class="mt-3 text-slate-700">{{ review.comment }}</p>
              </article>
            </div>
            <div v-else class="mt-8 rounded-xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">
              ยังไม่มีรีวิวสำหรับสนามนี้ เป็นคนแรกที่รีวิวเลย!
            </div>
          </section>
        </div>

        <aside class="reveal delay-2 lg:col-span-1">
          <div class="lg:sticky lg:top-24">
            <section class="summary-card p-6 sm:p-7">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Booking Summary</p>
              <h2 class="mt-2 text-2xl font-bold text-slate-900">สรุปการจอง</h2>
              <p class="mt-1 text-sm text-slate-600">ตรวจสอบรายละเอียดก่อนดำเนินการต่อ</p>

              <div class="mt-5 overflow-hidden rounded-2xl border border-white/70 bg-white/80">
                <div class="border-b border-slate-200/70 px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Date</p>
                  <p class="mt-1 font-medium text-slate-800">{{ selectedDateText }}</p>
                </div>
                <div class="grid grid-cols-2 gap-0">
                  <div class="border-r border-slate-200/70 px-4 py-3">
                    <p class="text-xs text-slate-500">ช่วงเวลา</p>
                    <p class="text-lg font-bold text-slate-800">{{ selectedSlots.length }}</p>
                  </div>
                  <div class="px-4 py-3">
                    <p class="text-xs text-slate-500">อุปกรณ์</p>
                    <p class="text-lg font-bold text-slate-800">{{ totalEquipmentItems }}</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedSlots.length" class="mt-4 max-h-32 overflow-auto rounded-xl border border-slate-200/70 bg-white/70 p-3 text-xs text-slate-600">
                <p class="mb-2 font-semibold text-slate-700">ช่วงเวลาที่เลือก</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="slot in selectedSlots"
                    :key="slot.time"
                    class="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700"
                  >
                    {{ slot.time }}
                  </span>
                </div>
              </div>

              <div class="mt-6 space-y-3 border-t border-slate-200/70 pt-5 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">ค่าสนาม</span>
                  <span class="font-medium text-slate-800">{{ totalFieldPrice.toLocaleString() }} บาท</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">ค่าอุปกรณ์</span>
                  <span class="font-medium text-slate-800">{{ totalEquipmentPrice.toLocaleString() }} บาท</span>
                </div>
              </div>

              <div class="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-4">
                <span class="text-lg font-semibold text-slate-900">รวมทั้งหมด</span>
                <span class="text-2xl font-bold text-emerald-600">{{ grandTotal.toLocaleString() }} บาท</span>
              </div>

              <div class="mt-4 overflow-hidden rounded-full bg-white/90">
                <div
                  class="h-2 bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-300"
                  :style="{ width: progressWidth }"
                ></div>
              </div>
              <p class="mt-2 text-xs text-slate-500">สถานะการเลือก: {{ selectedSlots.length }} / 13 ช่วงเวลา</p>

              <button
                @click="goToCheckout"
                :disabled="selectedSlots.length === 0"
                class="mt-6 w-full rounded-xl bg-slate-950 py-3 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                ดำเนินการต่อ
              </button>
              <p v-if="selectedSlots.length === 0" class="mt-2 text-center text-xs text-slate-500">
                เลือกเวลาอย่างน้อย 1 ชั่วโมงเพื่อทำรายการต่อ
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import FieldService from '@/services/FieldService'
import EquipmentService from '@/services/EquipmentService'
import ReviewService from '@/services/ReviewService'
import { mapState, mapActions } from 'pinia'
import { useAuthenStore } from '@/stores/authen'
import { useBookingStore } from '@/stores/booking'

export default {
  name: 'FieldDetail',
  data() {
    return {
      loading: true,
      field: {},
      selectedDate: new Date().toISOString().substr(0, 10),
      slots: [],
      equipments: [],
      reviews: [],
      newReview: {
        rating: 5,
        comment: ''
      }
    }
  },
  computed: {
    ...mapState(useAuthenStore, ['isLoggedIn', 'user']),
    ...mapState(useBookingStore, {
        selectedSlots: 'selectedSlots',
        selectedEquipments: 'selectedEquipments',
        totalFieldPrice: 'totalFieldPrice',
        totalEquipmentPrice: 'totalEquipmentPrice',
        grandTotal: 'grandTotal'
    }),
    
    isSelected() {
      const selectedTimes = new Set(this.selectedSlots.map(s => s.time));
      return (slot) => selectedTimes.has(slot.time);
    },

    todayDate() {
      return new Date().toISOString().split('T')[0];
    },

    selectedDateText() {
      if (!this.selectedDate) return 'ยังไม่ได้เลือกวันที่';
      const date = new Date(this.selectedDate);
      return `วันที่ ${date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    },

    availableSlotsCount() {
      return this.slots.filter(slot => slot.available).length;
    },

    occupiedSlotsCount() {
      return this.slots.filter(slot => !slot.available).length;
    },

    totalEquipmentItems() {
      return Object.values(this.selectedEquipments).reduce((sum, count) => sum + Number(count || 0), 0);
    },

    progressWidth() {
      const totalSlots = 13;
      const percentage = Math.min((this.selectedSlots.length / totalSlots) * 100, 100);
      return `${percentage}%`;
    },
    
    fieldThumbnailUrl() {
        const baseUrl = 'http://localhost:8081' // Make sure this matches your server address
        return this.field.thumbnail ? `${baseUrl}${this.field.thumbnail}` : 'https://placehold.co/1200x400/22c55e/white?text=Sport+Field'
    }
  },
  async mounted() {
    this.loading = true;
    this.clearBooking(); 
    try {
      await this.loadFieldData();
      await this.fetchEquipments();
      await this.fetchReviews();
      this.fetchSlots();
    } catch (error) {
      console.error("Initialization failed:", error)
    } finally {
      this.loading = false;
    }
  },
  methods: {
    ...mapActions(useBookingStore, ['clearBooking', 'toggleSlot', 'updateEquipmentCount', 'setEquipmentDetails', 'setBookingDetails']),

    async loadFieldData() {
      try {
        const fieldId = this.$route.params.fieldId;
        const response = await FieldService.show(fieldId);
        this.field = response.data;
      } catch (error) {
        console.error('Failed to load field data:', error);
        // Optional: redirect to a not-found page or show an error message
      }
    },
    
    async fetchEquipments() {
      try {
        const response = await EquipmentService.index();
        this.equipments = response.data;
        this.setEquipmentDetails(this.equipments);
      } catch (e) {
        console.error('Could not fetch equipment', e);
      }
    },
    
    async fetchReviews() {
      try {
        const fieldId = this.$route.params.fieldId;
        const response = await ReviewService.index(fieldId);
        this.reviews = response.data;
      } catch (e) {
        console.error('could not fetch reviews', e);
      }
    },
    
    async submitReview() {
      if (!this.isLoggedIn) {
        alert('กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว');
        return this.$router.push({ name: 'login' });
      }
      try {
        const fieldId = this.field.id;
        await ReviewService.post({
          fieldId: fieldId,
          ...this.newReview
        });
        this.newReview.comment = '';
        this.newReview.rating = 5;
        await this.fetchReviews(); // Refresh reviews
      } catch (error) {
        console.error('Failed to submit review:', error);
        alert(error.response?.data?.error || 'ไม่สามารถส่งรีวิวได้');
      }
    },
    
    async fetchSlots() {
      this.clearBooking();
      if (!this.field.id || !this.selectedDate) {
        this.slots = []
        return
      }

      const allSlots = [];
      for (let hour = 9; hour < 22; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
        allSlots.push({
          time: time,
          price: parseFloat(this.field.price) || 1000,
          available: true,
          startTime: new Date(`${this.selectedDate}T${hour.toString().padStart(2, '0')}:00:00`),
          endTime: new Date(`${this.selectedDate}T${(hour + 1).toString().padStart(2, '0')}:00:00`)
        });
      }

      try {
        const startOfDay = new Date(this.selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(this.selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const response = await FieldService.getAvailability(this.field.id, {
          start: startOfDay.toISOString(),
          end: endOfDay.toISOString(),
        });
        const bookings = response.data;

        bookings.forEach(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          allSlots.forEach(slot => {
            if (slot.startTime < bookingEnd && slot.endTime > bookingStart) {
              slot.available = false;
            }
          });
        });

        this.slots = allSlots;

      } catch (error) {
        console.error('Failed to fetch availability:', error);
        this.slots = allSlots.map(s => ({ ...s, available: false }));
      }
    },
    getEquipmentCount(id) {
      return this.selectedEquipments[id] || 0;
    },
    formatRating(value) {
      return Number(value || 0).toFixed(1);
    },
    goToCheckout() {
      if (!this.isLoggedIn) {
        alert('กรุณาเข้าสู่ระบบเพื่อทำการจอง');
        return this.$router.push({ name: 'login' });
      }
      if (this.selectedSlots.length === 0) {
        return alert('กรุณาเลือกช่วงเวลาที่ต้องการจอง');
      }
      this.setBookingDetails({
        field: this.field,
        date: this.selectedDate,
        slots: this.selectedSlots,
        equipment: this.selectedEquipments,
        equipmentDetails: this.equipments,
        total: this.grandTotal
      });

      this.$router.push({
        name: 'checkout',
      });
    }
  }
}
</script>

<style scoped>
.page-shell {
  --brand-emerald: #059669;
  --brand-amber: #f59e0b;
  --brand-ink: #0f172a;
  background:
    radial-gradient(1000px 380px at 10% -10%, rgba(16, 185, 129, 0.18), transparent 55%),
    radial-gradient(900px 420px at 95% 0%, rgba(245, 158, 11, 0.15), transparent 60%),
    linear-gradient(180deg, #f7faf8 0%, #edf2f7 45%, #f5f7fb 100%);
  font-family: "Sarabun", "Kanit", "Segoe UI", sans-serif;
}

.loading-block {
  background: linear-gradient(90deg, #e2e8f0 20%, #f8fafc 50%, #e2e8f0 80%);
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite linear;
}

.hero-card {
  overflow: hidden;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
}

.hero-side {
  padding: 1.5rem;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 250, 0.7)),
    repeating-linear-gradient(
      45deg,
      rgba(15, 23, 42, 0.015),
      rgba(15, 23, 42, 0.015) 8px,
      transparent 8px,
      transparent 16px
    );
}

.panel {
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.92);
  padding: 1.5rem;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
}

.summary-card {
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(236, 253, 245, 0.82)),
    repeating-linear-gradient(
      -45deg,
      rgba(5, 150, 105, 0.02),
      rgba(5, 150, 105, 0.02) 10px,
      transparent 10px,
      transparent 20px
    );
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
}

.section-kicker {
  margin-bottom: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-emerald);
}

.reveal {
  opacity: 0;
  transform: translateY(14px);
  animation: reveal-up 450ms ease-out forwards;
}

.delay-1 {
  animation-delay: 70ms;
}

.delay-2 {
  animation-delay: 140ms;
}

.delay-3 {
  animation-delay: 220ms;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 640px) {
  .hero-side {
    padding: 2rem;
  }

  .panel {
    padding: 1.75rem;
  }
}
</style>
