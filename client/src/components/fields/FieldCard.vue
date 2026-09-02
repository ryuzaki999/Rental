<template>
  <article class="card group">
    <div class="card-image-wrapper">
      <div class="card-image-inner">
        <img 
          :src="field.image || 'https://via.placeholder.com/400x225.png?text=No+Image'" 
          :alt="field.name" 
          class="card-image"
        />
      </div>
      <div class="status-pill">
        ว่าง
      </div>
    </div>

    <div class="card-body">
      <h3 class="card-title">
        {{ field.name }}
      </h3>

      <div class="card-location">
        <svg xmlns="http://www.w3.org/2000/svg" class="location-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
        <span class="location-text">
          {{ field.location || 'ไม่ระบุสถานที่' }}
        </span>
      </div>

      <p class="card-price">
        ฿{{ new Intl.NumberFormat().format(field.price) }} <span>/ ชั่วโมง</span>
      </p>

      <div class="card-footer">
        <button
          type="button"
          class="primary-action"
          @click="$emit('view', field.id)"
        >
          ดูรายละเอียด
        </button>

        <div v-if="isAdmin" class="admin-actions">
          <button
            type="button"
            class="admin-button admin-edit"
            @click="$emit('edit', field.id)"
          >
            แก้ไข
          </button>
          <button
            type="button"
            class="admin-button admin-delete"
            @click="$emit('delete', field)"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import { mapState } from 'pinia'
import { useAuthenStore } from '@/stores/authen'

export default {
  props: {
    field: {
      type: Object,
      required: true
    }
  },
  emits: ['view', 'edit', 'delete'],
  computed: {
    ...mapState(useAuthenStore, ['user', 'isUserLoggedIn']),
    isAdmin() {
      return this.isUserLoggedIn && this.user && this.user.role === 'admin'
    }
  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  flex-direction: column;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.16);
  border-color: rgba(59, 130, 246, 0.6);
}

.card-image-wrapper {
  position: relative;
}

.card-image-inner {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .card-image {
  transform: scale(1.04);
}

.status-pill {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.95);
  color: #ecfdf5;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-body {
  padding: 0.9rem 1rem 1rem;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-location {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.location-icon {
  width: 14px;
  height: 14px;
}

.location-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-price {
  margin-top: 0.6rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #1d4ed8;
}

.card-price span {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  margin-left: 0.15rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.primary-action {
  flex: 1;
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  border: none;
  background: linear-gradient(135deg, #0ea5e9, #1d4ed8);
  color: #eff6ff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.45);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.primary-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px rgba(37, 99, 235, 0.55);
  background: linear-gradient(135deg, #0284c7, #1d4ed8);
}

.admin-actions {
  display: inline-flex;
  gap: 0.3rem;
}

.admin-button {
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.admin-edit {
  background: #e5e7eb;
  color: #111827;
}

.admin-edit:hover {
  background: #d1d5db;
}

.admin-delete {
  background: #ef4444;
  color: #fef2f2;
}

.admin-delete:hover {
  background: #dc2626;
}
</style>
