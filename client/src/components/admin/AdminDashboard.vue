<template>
  <div class="owner-page">
    <div class="owner-inner">
      <header class="owner-header">
        <div>
          <p class="owner-kicker">Owner Console</p>
          <h1 class="owner-title">แดชบอร์ดเจ้าของสนาม</h1>
          <p class="owner-subtitle">จัดการสนาม การจอง สต็อก และผู้ใช้งานจากหน้าเดียว</p>
        </div>
        <div class="header-actions">
          <button class="btn primary" @click="goTo('field-create')">+ เพิ่มสนามใหม่</button>
        </div>
      </header>

      <div v-if="!isAdmin" class="state-box error">
        คุณไม่มีสิทธิ์เข้าถึงแดชบอร์ดเจ้าของสนาม
      </div>

      <section v-else>
        <div class="stats-grid">
          <article class="stat-card">
            <p class="stat-label">สนามทั้งหมด</p>
            <p class="stat-value">{{ fields.length }}</p>
          </article>
          <article class="stat-card">
            <p class="stat-label">การจองทั้งหมด</p>
            <p class="stat-value">{{ bookings.length }}</p>
          </article>
          <article class="stat-card">
            <p class="stat-label">รอชำระเงิน</p>
            <p class="stat-value">{{ pendingPaymentCount }}</p>
          </article>
          <article class="stat-card">
            <p class="stat-label">อุปกรณ์ใกล้หมด</p>
            <p class="stat-value">{{ lowStockCount }}</p>
          </article>
        </div>

        <div v-if="error" class="state-box error">{{ error }}</div>

        <section class="panel">
          <div class="panel-header">
            <h2>จัดการสนาม</h2>
          </div>
          <div v-if="fields.length === 0" class="state-box">ยังไม่มีข้อมูลสนาม</div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>สนาม</th>
                  <th>ประเภทกีฬา</th>
                  <th>ราคา/ชม.</th>
                  <th>สถานะ</th>
                  <th class="actions-col">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="f in fields" :key="f.id">
                  <td>
                    <p class="primary-text">{{ f.name }}</p>
                    <p class="sub-text">{{ f.location }}</p>
                  </td>
                  <td>{{ f.sportType || '-' }}</td>
                  <td>{{ f.price || '-' }}</td>
                  <td><span class="chip" :class="f.status === 'available' ? 'green' : 'gray'">{{ statusLabel(f.status) }}</span></td>
                  <td class="actions-col">
                    <button class="inline-btn" @click="goTo('field-edit', { fieldId: f.id })">แก้ไข</button>
                    <button class="inline-btn danger" @click="removeField(f)">ลบ</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <h2>การจองล่าสุด</h2>
          </div>
          <div v-if="bookings.length === 0" class="state-box">ยังไม่มีการจอง</div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>สนาม</th>
                  <th>ผู้จอง</th>
                  <th>เวลา</th>
                  <th>สถานะ</th>
                  <th class="actions-col">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in bookings.slice(0, 12)" :key="b.id">
                  <td>{{ b.Field ? b.Field.name : `#${b.fieldId}` }}</td>
                  <td>{{ b.User ? (b.User.name || b.User.email) : `#${b.userId}` }}</td>
                  <td>{{ format(b.startTime) }}</td>
                  <td><span class="chip" :class="statusClass(b.status)">{{ statusLabel(b.status) }}</span></td>
                  <td class="actions-col">
                    <button class="inline-btn" @click="checkin(b)" :disabled="b.checkedIn || b.status === 'cancelled'">เช็คอิน</button>
                    <button class="inline-btn danger" @click="cancel(b)" :disabled="b.status === 'cancelled'">ยกเลิก</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <h2>สต็อกอุปกรณ์</h2>
          </div>
          <div v-if="equipment.length === 0" class="state-box">ยังไม่มีข้อมูลอุปกรณ์</div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th>คงเหลือ</th>
                  <th class="actions-col">ปรับสต็อก</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in equipment" :key="e.id">
                  <td>{{ e.name }}</td>
                  <td><span class="chip" :class="Number(e.stock) <= 3 ? 'amber' : 'green'">{{ e.stock }}</span></td>
                  <td class="actions-col">
                    <button class="inline-btn" @click="adjust(e, 1)">+1</button>
                    <button class="inline-btn danger" @click="adjust(e, -1)">-1</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <h2>ผู้ใช้งานและสิทธิ์</h2>
          </div>
          <div v-if="users.length === 0" class="state-box">ยังไม่มีผู้ใช้งาน</div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ผู้ใช้งาน</th>
                  <th>สิทธิ์</th>
                  <th class="actions-col">ปรับสิทธิ์</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users" :key="u.id">
                  <td>
                    <p class="primary-text">{{ u.name }} {{ u.lastname }}</p>
                    <p class="sub-text">{{ u.email }}</p>
                  </td>
                  <td><span class="chip" :class="u.role === 'admin' ? 'purple' : 'gray'">{{ u.role }}</span></td>
                  <td class="actions-col">
                    <button class="inline-btn" @click="setRole(u, 'admin')" :disabled="u.role === 'admin'">ตั้งเป็นเจ้าของ</button>
                    <button class="inline-btn danger" @click="setRole(u, 'user')" :disabled="u.role === 'user'">ตั้งเป็นผู้ใช้</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <h2>บันทึกกิจกรรมล่าสุด</h2>
          </div>
          <div v-if="audits.length === 0" class="state-box">ยังไม่มีบันทึกกิจกรรม</div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>เวลา</th>
                  <th>ผู้กระทำ</th>
                  <th>กิจกรรม</th>
                  <th>รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in audits.slice(0, 15)" :key="a.id">
                  <td>{{ format(a.createdAt) }}</td>
                  <td>{{ a.actorEmail || a.actorId || '-' }}</td>
                  <td>{{ actionLabel(a.action) }}</td>
                  <td>{{ detailText(a) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  </div>
</template>

<script>
import AuditService from '@/services/AuditService'
import BookingService from '@/services/BookingService'
import EquipmentService from '@/services/EquipmentService'
import FieldService from '@/services/FieldService'
import UserService from '@/services/UserService'
import { useAuthenStore } from '@/stores/authen'

export default {
  data () {
    return {
      bookings: [],
      equipment: [],
      users: [],
      fields: [],
      audits: [],
      error: ''
    }
  },
  computed: {
    isAdmin () {
      const s = useAuthenStore()
      return !!s.token && s.user && s.user.role === 'admin'
    },
    pendingPaymentCount () {
      return this.bookings.filter((b) => b.status === 'pending-payment').length
    },
    lowStockCount () {
      return this.equipment.filter((e) => Number(e.stock) <= 3).length
    }
  },
  async mounted () {
    if (!this.isAdmin) return
    await this.load()
  },
  methods: {
    async load () {
      this.error = ''
      try {
        const [bookingRes, equipmentRes, userRes, fieldRes, auditRes] = await Promise.all([
          BookingService.index({ all: 1, limit: 200 }),
          EquipmentService.index(),
          UserService.index(),
          FieldService.index({ limit: 200 }),
          AuditService.index()
        ])
        this.bookings = (bookingRes.data && bookingRes.data.rows) ? bookingRes.data.rows : []
        this.equipment = equipmentRes.data || []
        this.users = userRes.data || []
        this.fields = (fieldRes.data && fieldRes.data.rows) ? fieldRes.data.rows : []
        this.audits = auditRes.data || []
      } catch (e) {
        console.error(e)
        this.error = 'โหลดข้อมูลแดชบอร์ดไม่สำเร็จ'
      }
    },
    goTo (name, params = {}) {
      this.$router.push({ name, params })
    },
    format (dt) {
      try { return new Date(dt).toLocaleString('th-TH') } catch (e) { return dt }
    },
    statusLabel (status) {
      if (status === 'pending-payment') return 'รอชำระเงิน'
      if (status === 'confirmed') return 'ยืนยันแล้ว'
      if (status === 'checked-in') return 'เช็คอินแล้ว'
      if (status === 'cancelled') return 'ยกเลิกแล้ว'
      return status || '-'
    },
    statusClass (status) {
      if (status === 'pending-payment') return 'amber'
      if (status === 'confirmed') return 'green'
      if (status === 'checked-in') return 'sky'
      if (status === 'cancelled') return 'gray'
      return 'gray'
    },
    actionLabel (action) {
      const map = {
        'booking-checkin': 'เช็คอินการจอง',
        'booking-payment-confirmed': 'ยืนยันการชำระเงิน',
        'booking-update': 'อัปเดตการจอง',
        'booking-delete': 'ลบการจอง',
        'equipment-stock': 'ปรับสต็อกอุปกรณ์',
        'role-change': 'เปลี่ยนสิทธิ์ผู้ใช้'
      }
      return map[action] || action || '-'
    },
    roleLabel (role) {
      if (role === 'admin') return 'เจ้าของสนาม'
      if (role === 'user') return 'ผู้ใช้'
      return role || '-'
    },
    detailText (a) {
      const d = a && a.details
      if (!d) return '-'
      const idMatch = d.match(/\d+/)
      switch (a.action) {
        case 'booking-checkin':
        case 'booking-payment-confirmed':
        case 'booking-delete':
          return idMatch ? `การจอง #${idMatch[0]}` : d
        case 'equipment-stock': {
          const m = d.match(/equipmentId:(\d+)\s+(\d+)\s*->\s*(\d+)/)
          if (m) return `อุปกรณ์ #${m[1]} (สต็อก ${m[2]} → ${m[3]})`
          return d
        }
        case 'role-change': {
          const m = d.match(/role:\s*(\S+)\s*->\s*(\S+)/)
          if (m) return `สิทธิ์: ${this.roleLabel(m[1])} → ${this.roleLabel(m[2])}`
          return d
        }
        case 'booking-update': {
          let out = d
          out = out.replace(/status:\s*(\S+)\s*->\s*(\S+)/g, (_, from, to) => `สถานะ: ${this.statusLabel(from)} → ${this.statusLabel(to)}`)
          out = out.replace(/checkedIn:\s*(\S+)\s*->\s*(\S+)/g, (_, from, to) => `เช็คอิน: ${from === 'true' ? 'ใช่' : 'ไม่ใช่'} → ${to === 'true' ? 'ใช่' : 'ไม่ใช่'}`)
          return out
        }
        default:
          return d
      }
    },
    async cancel (b) {
      try {
        await BookingService.put({ id: b.id, status: 'cancelled' })
        await this.load()
      } catch (e) { console.error(e) }
    },
    async checkin (b) {
      try {
        await BookingService.put({ id: b.id, checkedIn: true, status: 'checked-in' })
        await this.load()
      } catch (e) { console.error(e) }
    },
    async adjust (e, delta) {
      try {
        await EquipmentService.adjustStock(e.id, delta)
        await this.load()
      } catch (err) { console.error(err) }
    },
    async setRole (u, role) {
      try {
        const auth = useAuthenStore()
        if (auth.user && auth.user.id === u.id && role !== 'admin') {
          if (!confirm('คุณกำลังลดสิทธิ์ตัวเอง ต้องการดำเนินการต่อหรือไม่')) return
        }
        if (u.role === 'admin' && role !== 'admin') {
          if (!confirm(`ยืนยันลดสิทธิ์ ${u.email} จากเจ้าของสนาม`)) return
        }
        await UserService.put(u.id, { role })
        await this.load()
      } catch (err) {
        console.error(err)
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error)
        }
      }
    },
    async removeField (field) {
      if (!confirm(`ลบสนาม "${field.name}" ใช่หรือไม่`)) return
      try {
        await FieldService.delete({ id: field.id })
        await this.load()
      } catch (err) {
        console.error(err)
        alert('ลบสนามไม่สำเร็จ')
      }
    }
  }
}
</script>

<style scoped>
.owner-page {
  padding: 1.2rem 1rem 2.2rem;
}

.owner-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.owner-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.owner-kicker {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #4f46e5;
}

.owner-title {
  margin-top: 0.2rem;
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
}

.owner-subtitle {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 0.55rem;
}

.btn {
  border-radius: 999px;
  border: none;
  padding: 0.55rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #eff6ff;
}

.btn.secondary {
  background: #eef2ff;
  color: #4338ca;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.stat-card {
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);
  padding: 0.85rem;
}

.stat-label {
  font-size: 0.76rem;
  color: #64748b;
}

.stat-value {
  margin-top: 0.25rem;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
}

.panel {
  margin-top: 0.85rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);
  overflow: hidden;
}

.panel-header {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h2 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.72rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  font-size: 0.84rem;
  color: #1f2937;
  vertical-align: middle;
}

thead th {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  background: #f8fafc;
}

.primary-text {
  font-weight: 700;
  color: #0f172a;
}

.sub-text {
  margin-top: 0.12rem;
  color: #6b7280;
  font-size: 0.78rem;
}

.actions-col {
  white-space: nowrap;
}

.inline-btn {
  border: none;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.7rem;
  margin-right: 0.35rem;
  cursor: pointer;
}

.inline-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.inline-btn.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.62rem;
  font-size: 0.72rem;
  font-weight: 700;
}

.chip.green {
  background: #dcfce7;
  color: #166534;
}

.chip.gray {
  background: #f1f5f9;
  color: #475569;
}

.chip.amber {
  background: #fef3c7;
  color: #92400e;
}

.chip.purple {
  background: #ede9fe;
  color: #5b21b6;
}

.chip.sky {
  background: #e0f2fe;
  color: #0c4a6e;
}

.state-box {
  border-radius: 0.9rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.8rem 0.95rem;
  color: #334155;
  font-size: 0.86rem;
}

.state-box.error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

@media (max-width: 980px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .owner-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
