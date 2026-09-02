<template>
  <div class="edit-field-page">
    <div class="edit-field-card">
      <header class="header">
        <p class="kicker">สำหรับเจ้าของสนาม</p>
        <h1 class="title">แก้ไขข้อมูลสนาม</h1>
        <p class="subtitle">
          อัปเดตรายละเอียด รูปภาพ และสถานะสนามให้เป็นปัจจุบัน
        </p>
      </header>

      <form class="field-form" @submit.prevent="editField">
        <div class="grid two-cols">
          <label class="field">
            <span class="label">ชื่อสนาม</span>
            <input v-model.trim="field.name" type="text" required class="input" />
          </label>

          <label class="field">
            <span class="label">ประเภทกีฬา</span>
            <select v-model="field.sportType" required class="input">
              <option value="" disabled>เลือกประเภทกีฬา</option>
              <option value="ฟุตบอล">ฟุตบอล</option>
              <option value="แบดมินตัน">แบดมินตัน</option>
              <option value="บาสเกตบอล">บาสเกตบอล</option>
              <option value="วอลเลย์บอล">วอลเลย์บอล</option>
              <option value="เทนนิส">เทนนิส</option>
            </select>
          </label>
        </div>

        <div class="grid two-cols">
          <label class="field">
            <span class="label">สถานที่</span>
            <input v-model.trim="field.location" type="text" required class="input" />
          </label>

          <label class="field">
            <span class="label">สถานะสนาม</span>
            <select v-model="field.status" class="input">
              <option value="available">พร้อมให้จอง</option>
              <option value="closed">ปิดให้บริการ</option>
            </select>
          </label>
        </div>

        <div class="grid two-cols">
          <label class="field">
            <span class="label">ความจุ (คน)</span>
            <input v-model.number="field.capacity" type="number" min="1" required class="input" />
          </label>

          <label class="field">
            <span class="label">ราคา/ชั่วโมง (บาท)</span>
            <input v-model.number="field.price" type="number" min="1" required class="input" />
          </label>
        </div>

        <label class="field">
          <span class="label">รายละเอียดสนาม</span>
          <textarea v-model.trim="field.description" rows="4" class="input textarea"></textarea>
        </label>

        <section class="media-panel">
          <h2 class="media-title">รูปหลักของสนาม</h2>
          <div v-if="field.image" class="main-image-wrap">
            <img :src="field.image" alt="preview" class="main-image" />
            <button type="button" class="inline-btn danger" @click="removeMainImage">ลบรูปหลัก</button>
          </div>
          <Upload label="อัปโหลดรูปหลักใหม่" @uploaded="onUploaded" />
        </section>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="actions">
          <button type="button" class="btn ghost" @click="$router.back()">ยกเลิก</button>
          <button type="submit" class="btn primary" :disabled="submitting">
            {{ submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Upload from '@/components/Upload.vue';
import FieldService from '@/services/FieldService';

export default {
  components: { Upload },
  data () {
    return {
      submitting: false,
      error: '',
      field: {
        id: null,
        name: '',
        sportType: '',
        location: '',
        capacity: 1,
        price: 1,
        status: 'available',
        image: '',
        description: '',
        gallery: ''
      }
    }
  },
  async created () {
    try {
      const fieldId = this.$route.params.fieldId
      this.field = (await FieldService.show(fieldId)).data
      this.field.capacity = parseInt(this.field.capacity) || 1
      this.field.price = parseInt(this.field.price) || 1
      if (!this.field.status) this.field.status = 'available'
    } catch (err) {
      console.log(err)
      this.error = 'โหลดข้อมูลสนามไม่สำเร็จ'
    }
  },
  methods: {
    onUploaded (imagePath) {
      this.field.image = imagePath
    },
    async removeMainImage () {
      if (!this.field.image) return
      try {
        await FieldService.deleteUpload({ path: this.field.image })
      } catch (err) {
        console.log(err)
      }
      this.field.image = ''
    },
    async editField () {
      this.error = ''
      if (!this.field.name || !this.field.sportType || !this.field.location) {
        this.error = 'กรุณากรอกชื่อสนาม ประเภทกีฬา และสถานที่ให้ครบ'
        return
      }
      if (!Number.isFinite(this.field.capacity) || this.field.capacity < 1) {
        this.error = 'ความจุต้องมากกว่าหรือเท่ากับ 1 คน'
        return
      }
      if (!Number.isFinite(this.field.price) || this.field.price < 1) {
        this.error = 'ราคาต่อชั่วโมงต้องมากกว่าหรือเท่ากับ 1 บาท'
        return
      }
      try {
        this.submitting = true
        const payload = Object.assign({}, this.field, {
          capacity: parseInt(this.field.capacity),
          price: String(parseInt(this.field.price))
        })
        await FieldService.put(payload)
        this.$router.push({ name: 'fields' })
      } catch (err) {
        console.log(err)
        this.error = err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'บันทึกการแก้ไขไม่สำเร็จ'
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.edit-field-page {
  padding: 1.5rem 1rem 2.5rem;
}

.edit-field-card {
  max-width: 920px;
  margin: 0 auto;
  border-radius: 1.5rem;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.12);
  padding: 1.75rem 1.75rem 1.9rem;
}

.header {
  margin-bottom: 1.2rem;
}

.kicker {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2563eb;
}

.title {
  margin-top: 0.25rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.subtitle {
  margin-top: 0.35rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.field-form {
  display: grid;
  gap: 0.95rem;
}

.grid {
  display: grid;
  gap: 0.9rem;
}

.two-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field {
  display: grid;
  gap: 0.35rem;
}

.label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.input {
  width: 100%;
  border-radius: 0.9rem;
  border: 1px solid #d1d5db;
  padding: 0.58rem 0.8rem;
  font-size: 0.9rem;
  color: #111827;
}

.input:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 1px;
  border-color: #0ea5e9;
}

.textarea {
  resize: vertical;
  min-height: 108px;
}

.media-panel {
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  padding: 0.9rem;
}

.media-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.6rem;
}

.main-image-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
}

.main-image {
  width: 100%;
  max-width: 420px;
  height: 230px;
  object-fit: cover;
  border-radius: 0.85rem;
  border: 1px solid #cbd5e1;
}

.error {
  color: #dc2626;
  font-size: 0.82rem;
}

.actions {
  margin-top: 0.4rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.btn {
  border-radius: 999px;
  border: none;
  padding: 0.58rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.btn.ghost {
  background: #f3f4f6;
  color: #374151;
}

.btn.ghost:hover {
  background: #e5e7eb;
}

.btn.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #eff6ff;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.42);
}

.btn.primary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.btn.primary:disabled {
  opacity: 0.72;
  cursor: not-allowed;
  box-shadow: none;
}

.inline-btn {
  border: none;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.inline-btn.danger {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 768px) {
  .two-cols {
    grid-template-columns: minmax(0, 1fr);
  }

  .actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}
</style>
