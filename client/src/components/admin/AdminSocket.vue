<template>
  <div style="padding:16px">
    <h2>Admin — Realtime Events</h2>

    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
      <div>
        <label><input type="checkbox" v-model="filters.bookingCreated" /> booking:created</label>
        <label style="margin-left:8px"><input type="checkbox" v-model="filters.bookingUpdated" /> booking:updated</label>
        <label style="margin-left:8px"><input type="checkbox" v-model="filters.bookingDeleted" /> booking:deleted</label>
        <label style="margin-left:8px"><input type="checkbox" v-model="filters.auditCreated" /> audit:created</label>
      </div>
      <div style="margin-left:8px">
        <input placeholder="Filter text" v-model="filterText" style="padding:6px;border:1px solid #ddd;border-radius:4px" />
      </div>
      <div>
        <button @click="clear">Clear</button>
        <button @click="togglePause" style="margin-left:8px">{{ paused ? 'Resume' : 'Pause' }}</button>
      </div>
      <div style="margin-left:auto;color:#666">Events: {{ events.length }} (max {{ maxEvents }})</div>
    </div>

    <div v-if="events.length===0">No events yet.</div>
    <ul>
      <li v-for="(e, idx) in events" :key="idx" style="border:1px solid #e5e7eb;padding:8px;margin-bottom:8px;border-radius:6px">
        <div><strong>{{ e.type }}</strong> <small>{{ e.time }}</small></div>
        <pre style="white-space:pre-wrap">{{ e.payload }}</pre>
      </li>
    </ul>
  </div>
</template>

<script>
import { useAuthenStore } from '@/stores/authen';
import { io as ioClient } from 'socket.io-client';

export default {
  data() {
    return { events: [], socket: null, paused: false, maxEvents: 200, filterText: '', filters: { bookingCreated: true, bookingUpdated: true, bookingDeleted: true, auditCreated: true } }
  },
  mounted() {
    const auth = useAuthenStore()
    const token = auth.token
    this.socket = ioClient('/admin', { auth: { token } })
    this.socket.on('connect', () => this.pushEvent('connect', { id: this.socket.id }))
    this.socket.on('connect_error', (err) => this.pushEvent('connect_error', { message: err.message }))
    this.socket.on('booking:created', (p) => this.pushEvent('booking:created', p))
    this.socket.on('booking:updated', (p) => this.pushEvent('booking:updated', p))
    this.socket.on('booking:deleted', (p) => this.pushEvent('booking:deleted', p))
    this.socket.on('audit:created', (p) => this.pushEvent('audit:created', p))

    // load saved preferences
    try {
      const raw = localStorage.getItem('adminSocketPrefs')
      if (raw) {
        const prefs = JSON.parse(raw)
        if (prefs.filters) this.filters = Object.assign(this.filters, prefs.filters)
        if (typeof prefs.paused === 'boolean') this.paused = prefs.paused
        if (prefs.maxEvents) this.maxEvents = prefs.maxEvents
        if (prefs.filterText) this.filterText = prefs.filterText
      }
    } catch (e) { console.error('Failed to load prefs', e) }
  },
  beforeUnmount() {
    try { this.socket && this.socket.disconnect() } catch (e) {}
  },
  methods: {
    pushEvent(type, payload) {
      if (this.paused) return

      // filter events
      if (type === 'booking:created' && !this.filters.bookingCreated) return
      if (type === 'booking:updated' && !this.filters.bookingUpdated) return
      if (type === 'booking:deleted' && !this.filters.bookingDeleted) return
      if (type === 'audit:created' && !this.filters.auditCreated) return

      // text filter
      if (this.filterText && this.filterText.trim()) {
        const s = this.filterText.trim().toLowerCase()
        const combined = `${type} ${JSON.stringify(payload)}`.toLowerCase()
        if (!combined.includes(s)) return
      }

      this.events.unshift({ type, payload: JSON.stringify(payload, null, 2), time: new Date().toLocaleString() })
      // cap size
      if (this.events.length > this.maxEvents) this.events.splice(this.maxEvents)
    },
    clear() { this.events = [] },
    togglePause() { this.paused = !this.paused; this.savePrefs() },
    savePrefs() {
      try {
        const prefs = { filters: this.filters, paused: this.paused, maxEvents: this.maxEvents, filterText: this.filterText }
        localStorage.setItem('adminSocketPrefs', JSON.stringify(prefs))
      } catch (e) { console.error('Failed to save prefs', e) }
    }
  }
}
</script>

<style scoped>
pre { background:#f8fafc;padding:8px;border-radius:4px }
</style>
