<template>
  <div class="calendar-booking">
    <h3>ปฏิทินการจอง (7 วัน)</h3>
    <div class="calendar-grid">
      <div class="day" v-for="day in days" :key="day.dateStr">
        <div class="day-header">{{ day.label }}</div>
        <div class="slots">
          <div v-for="slot in day.slots" :key="slot.start" class="slot" :class="{ booked: slot.booked }">
            <button v-if="!slot.booked" @click="selectSlot(slot)" class="slot-btn">{{ slot.label }}</button>
            <div v-else class="slot-booked">เต็ม</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Api from '@/services/Api';

export default {
  props: { fieldId: { type: [Number,String], required: true } },
  data() {
    return { days: [] }
  },
  mounted() {
    this.buildGrid()
    this.loadBookings()
  },
  methods: {
    buildGrid() {
      const hours = Array.from({length: 16}, (_,i) => i + 6) // 6..21
      const days = []
      const now = new Date()
      for (let d = 0; d < 7; d++) {
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d)
        const dateStr = day.toISOString().slice(0,10)
        days.push({ date: day, dateStr, label: day.toLocaleDateString(), slots: hours.map(h => {
          const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, 0, 0)
          const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h+1, 0, 0)
          return { start: start.toISOString(), end: end.toISOString(), label: `${h}:00 - ${h+1}:00`, booked: false }
        }) })
      }
      this.days = days
    },
    async loadBookings() {
      try {
        const api = Api()
        const start = this.days[0].date.toISOString()
        const endDate = new Date(this.days[this.days.length - 1].date)
        endDate.setHours(23, 59, 59, 999)
        const end = endDate.toISOString()
        const res = await api.get(`field/${this.fieldId}/availability`, { params: { start, end } })
        const bookings = res.data || []
        // mark slots as booked if overlap
        for (const b of bookings) {
          const bs = new Date(b.startTime)
          const be = new Date(b.endTime)
          for (const day of this.days) {
            for (const slot of day.slots) {
              const ss = new Date(slot.start)
              const se = new Date(slot.end)
              if (ss < be && se > bs) {
                slot.booked = true
              }
            }
          }
        }
      } catch (e) {
        console.error('loadBookings', e)
      }
    },
    selectSlot(slot) {
      // navigate to booking form with prefilled start/end
      const qs = { fieldId: this.fieldId, start: slot.start, end: slot.end }
      this.$router.push({ name: 'booking-create', query: qs })
    }
  }
}
</script>

<style scoped>
.calendar-grid { display:flex;gap:12px;overflow:auto }
.day { min-width:140px;border:1px solid #e5e7eb;border-radius:6px;padding:8px;background:#fff }
.day-header { font-weight:bold;margin-bottom:6px }
.slots { display:flex;flex-direction:column;gap:6px }
.slot { }
.slot-btn { width:100%; padding:6px;border-radius:4px;border:1px solid #d1d5db;background:#f8fafc;cursor:pointer }
.slot-booked { width:100%; padding:6px;border-radius:4px;border:1px solid #f1f5f9;background:#fee2e2;color:#9b1c1c;text-align:center }
.booked .slot-btn { display:none }
</style>
