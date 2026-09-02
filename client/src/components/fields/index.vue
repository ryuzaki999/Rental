<template>
  <div class="fields-page">
    <div class="fields-inner">
      <header class="fields-header">
        <div>
          <p class="fields-kicker">SportRental Discovery</p>
          <h1 class="fields-title">ค้นหาสนามกีฬา</h1>
          <p class="fields-subtitle">
            เลือกสนามที่ตรงกับงบประมาณ ทำเล และประเภทกีฬาที่ต้องการ พร้อมดูรายละเอียดและจองได้ทันที
          </p>
        </div>

        <button
          v-if="isAdmin"
          type="button"
          @click="navigateTo('/field/create')"
          class="create-button"
        >
          + สร้างสนามใหม่
        </button>
      </header>

      <FilterBar v-model:filters="filters" />

      <div class="results-meta" v-if="!loading">
        <span class="results-count">
          พบทั้งหมด {{ total }} สนาม
        </span>
        <span v-if="activeFilterCount > 0" class="active-filter">
          ใช้ตัวกรอง {{ activeFilterCount }} รายการ
        </span>
      </div>

      <section aria-label="Field list">
        <div v-if="fields.length" class="fields-grid">
          <FieldCard
            v-for="field in fields"
            :key="field.id"
            :field="field"
            @view="navigateTo('/field/' + $event)"
            @edit="navigateTo('/field/edit/' + $event)"
            @delete="deleteField"
          />
        </div>

        <div v-if="loading" class="state-message">
          กำลังโหลดรายการสนาม...
        </div>

        <div v-if="finished && fields.length > 0" class="state-message state-muted">
          แสดงครบทุกสนามแล้ว
        </div>

        <div v-if="!loading && fields.length === 0" class="state-message state-empty">
          ไม่พบสนามที่ตรงกับเงื่อนไขการค้นหา ลองปรับประเภทกีฬา พื้นที่ หรือช่วงราคา
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import FieldService from '@/services/FieldService'
import FieldCard from './FieldCard.vue'
import FilterBar from './FilterBar.vue'
import { useAuthenStore } from '@/stores/authen'

export default {
  components: {
    FieldCard,
    FilterBar
  },
  data() {
    return {
      filters: {
        search: '',
        sportType: '',
        location: '',
        min_price: '',
        max_price: ''
      },
      fields: [],
      limit: 12,
      offset: 0,
      loading: false,
      finished: false,
      total: 0,
      authStore: useAuthenStore()
    }
  },
  computed: {
    isAdmin() {
      return this.authStore.isUserLoggedIn && this.authStore.user && this.authStore.user.role === 'admin'
    },
    activeFilterCount() {
      const targets = [this.filters.search, this.filters.sportType, this.filters.location]
      const hasPrice = this.filters.min_price || this.filters.max_price
      const activeBasics = targets.filter((value) => (value || '').toString().trim() !== '').length
      return activeBasics + (hasPrice ? 1 : 0)
    }
  },
  created() {
    const q = this.$route.query || {}
    this.filters.search = q.search || ''
    this.filters.sportType = q.sportType || ''
    this.filters.location = q.location || ''
    this.filters.min_price = q.min_price || ''
    this.filters.max_price = q.max_price || ''

    this.debouncedFilter = this.debounce(() => this.loadFields(true), 420)
    this.loadFields(true)
    window.addEventListener('scroll', this.onScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  watch: {
    filters: {
      handler() {
        this.debouncedFilter()
      },
      deep: true
    },
    '$route.query': {
      handler(newQ) {
        this.filters.search = newQ.search || ''
        this.filters.sportType = newQ.sportType || ''
        this.filters.location = newQ.location || ''
        this.filters.min_price = newQ.min_price || ''
        this.filters.max_price = newQ.max_price || ''
      },
      deep: false
    }
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route)
    },
    async deleteField(field) {
      const result = confirm(`คุณต้องการลบสนาม "${field.name}" ใช่หรือไม่?`)
      if (!result) return
      try {
        await FieldService.delete(field)
        this.loadFields(true)
      } catch (err) {
        console.log(err)
      }
    },
    async loadFields(reset = false) {
      if (this.loading) return
      if (reset) {
        this.offset = 0
        this.fields = []
        this.finished = false
      }
      this.loading = true
      try {
        const params = {
          ...this.filters,
          limit: this.limit,
          offset: this.offset
        }
        const res = await FieldService.index(params)
        const rows = res.data.rows || []
        const count = res.data.count || 0
        this.fields.push(...rows)
        this.offset += rows.length
        this.total = count
        if (this.fields.length >= count) this.finished = true
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    onScroll() {
      if (this.loading || this.finished) return
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300
      if (nearBottom) this.loadFields(false)
    },
    debounce(fn, delay) {
      let t = null
      return function (...args) {
        clearTimeout(t)
        t = setTimeout(() => fn.apply(this, args), delay)
      }
    }
  }
}
</script>

<style scoped>
.fields-page {
  position: relative;
  padding: 1.3rem 1rem 2.8rem;
  min-height: 70vh;
  background:
    radial-gradient(1200px 420px at 0% -10%, rgba(56, 189, 248, 0.16), transparent 55%),
    radial-gradient(1200px 420px at 100% 0%, rgba(59, 130, 246, 0.12), transparent 56%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 52%, #f8fafc 100%);
}

.fields-inner {
  max-width: 1120px;
  margin: 0 auto;
}

.fields-header {
  margin-bottom: 1.05rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.fields-kicker {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  font-weight: 700;
  text-transform: uppercase;
  color: #0369a1;
}

.fields-title {
  margin: 0.32rem 0 0;
  font-size: clamp(1.72rem, 2.5vw, 2.5rem);
  line-height: 1.15;
  font-weight: 900;
  color: #0f172a;
}

.fields-subtitle {
  margin: 0.45rem 0 0;
  max-width: 39rem;
  color: #64748b;
  font-size: 0.92rem;
}

.create-button {
  margin-top: 0.2rem;
  border-radius: 999px;
  padding: 0.55rem 1.1rem;
  border: none;
  background: linear-gradient(135deg, #0ea5e9, #1d4ed8);
  color: #eff6ff;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  white-space: nowrap;
}

.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 15px 32px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, #0284c7, #1e40af);
}

.results-meta {
  margin-bottom: 0.9rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.results-count,
.active-filter {
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
}

.results-count {
  background: #dbeafe;
  color: #1d4ed8;
}

.active-filter {
  background: #e0f2fe;
  color: #0369a1;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.state-message {
  text-align: center;
  margin-top: 0.8rem;
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: rgba(255, 255, 255, 0.88);
  padding: 1.25rem 0.9rem;
  font-size: 0.9rem;
  color: #1e293b;
}

.state-muted {
  color: #475569;
}

.state-empty {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1e40af;
}

@media (max-width: 740px) {
  .fields-page {
    padding: 1rem 0.8rem 2.2rem;
  }

  .fields-header {
    flex-direction: column;
    align-items: stretch;
  }

  .create-button {
    align-self: flex-start;
  }
}
</style>
