<template>
  <div>
    <h2>อุปกรณ์</h2>
    <div class="grid">
      <div class="card" v-for="eq in equipment" :key="eq.id">
        <div class="card-body">
          <h4>{{ eq.name }}</h4>
          <p>สต็อก: {{ eq.stock }}</p>
          <p>ราคา: {{ eq.price }}</p>
          <div class="card-actions">
            <button @click="adjust(eq, -1)">ยืม 1</button>
            <button @click="adjust(eq, 1)">คืน 1</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EquipmentService from '@/services/EquipmentService';

export default {
  data() {
    return { equipment: [] }
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      const res = await EquipmentService.index()
      this.equipment = res.data || []
    },
    async adjust(eq, delta) {
      try {
        await EquipmentService.adjustStock(eq.id, delta)
        await this.load()
      } catch (err) { console.error(err) }
    }
  }
}
</script>

<style scoped>
.grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px }
.card{border:1px solid #e5e7eb;padding:8px;border-radius:6px}
.card-actions{display:flex;gap:8px}
</style>
