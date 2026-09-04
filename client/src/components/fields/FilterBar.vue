<template>
  <section class="filter-shell">
    <div class="filter-header">
      <div>
        <p class="filter-kicker">Smart Search</p>
        <h2 class="filter-title">ค้นหาสนามกีฬา</h2>
        <p class="filter-subtitle">
          ค้นหาและเปรียบเทียบสนามจากหลายพื้นที่ เลือกสนามที่ตรงกับงบประมาณและช่วงเวลาที่คุณต้องการ
        </p>
      </div>

      <button type="button" class="clear-btn" @click="clearFilters">
        ล้างตัวกรอง
      </button>
    </div>

    <div class="filter-grid">
      <label class="filter-field">
        <span class="field-label">ประเภทกีฬา</span>
        <select v-model="localFilters.sportType" class="field-control">
          <option value="">ทั้งหมด</option>
          <option value="ฟุตบอล">ฟุตบอล</option>
          <option value="แบดมินตัน">แบดมินตัน</option>
          <option value="บาสเกตบอล">บาสเกตบอล</option>
          <option value="วอลเลย์บอล">วอลเลย์บอล</option>
          <option value="เทนนิส">เทนนิส</option>
        </select>
      </label>

      <label class="filter-field">
        <span class="field-label">พื้นที่</span>
        <input
          v-model.trim="localFilters.location"
          type="text"
          class="field-control"
          placeholder="เขต / จังหวัด"
          autocomplete="off"
        />
      </label>

      <label class="filter-field">
        <span class="field-label">ช่วงราคา</span>
        <select v-model="priceRange" class="field-control" @change="updatePrice">
          <option value="">ทั้งหมด</option>
          <option value="0-500">฿0 - ฿500</option>
          <option value="501-1000">฿501 - ฿1,000</option>
          <option value="1001-2000">฿1,001 - ฿2,000</option>
          <option value="2001-99999">มากกว่า ฿2,000</option>
        </select>
      </label>

      <label class="filter-field filter-wide">
        <span class="field-label">ค้นหา</span>
        <div class="search-wrap">
          <span class="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.9" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model.trim="localFilters.search"
            type="text"
            class="search-control"
            placeholder="ชื่อสนาม หรือพื้นที่..."
            autocomplete="off"
          />
        </div>
      </label>
    </div>

    <div class="quick-row">
      <span class="quick-label">ค้นหาเร็ว:</span>
      <button
        type="button"
        class="quick-chip"
        :class="{ 'quick-chip-active': localFilters.sportType === 'ฟุตบอล' }"
        @click="setSport('ฟุตบอล')"
      >
        ฟุตบอล
      </button>
      <button
        type="button"
        class="quick-chip"
        :class="{ 'quick-chip-active': localFilters.sportType === 'แบดมินตัน' }"
        @click="setSport('แบดมินตัน')"
      >
        แบดมินตัน
      </button>
      <button
        type="button"
        class="quick-chip"
        :class="{ 'quick-chip-active': localFilters.max_price === '500' }"
        @click="setBudget('0-500')"
      >
        ไม่เกิน ฿500/ชม.
      </button>
      <button type="button" class="quick-chip" @click="clearFilters">
        รีเซ็ต
      </button>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    filters: {
      type: Object,
      required: true
    }
  },
  emits: ['update:filters'],
  data() {
    return {
      localFilters: this.normalizeFilters(this.filters),
      priceRange: ''
    }
  },
  watch: {
    filters: {
      handler(newFilters) {
        const normalized = this.normalizeFilters(newFilters)
        if (this.filtersDiffer(normalized)) {
          this.localFilters = normalized
        }
        this.syncPriceRange()
      },
      deep: true,
      immediate: true
    },
    localFilters: {
      handler(newValue) {
        this.$emit('update:filters', { ...newValue })
      },
      deep: true
    }
  },
  methods: {
    filtersDiffer(next) {
      const cur = this.localFilters || {}
      return cur.search !== next.search ||
        cur.sportType !== next.sportType ||
        cur.location !== next.location ||
        cur.min_price !== next.min_price ||
        cur.max_price !== next.max_price
    },
    normalizeFilters(value) {
      return {
        search: value?.search || '',
        sportType: value?.sportType || '',
        location: value?.location || '',
        min_price: value?.min_price || '',
        max_price: value?.max_price || ''
      }
    },
    syncPriceRange() {
      const min = String(this.localFilters.min_price || '')
      const max = String(this.localFilters.max_price || '')
      const combined = min && max ? `${min}-${max}` : ''
      const presetSet = new Set(['0-500', '501-1000', '1001-2000', '2001-99999'])

      this.priceRange = presetSet.has(combined) ? combined : ''
    },
    updatePrice() {
      if (!this.priceRange) {
        this.localFilters.min_price = ''
        this.localFilters.max_price = ''
        return
      }
      const [min, max] = this.priceRange.split('-')
      this.localFilters.min_price = min
      this.localFilters.max_price = max
    },
    clearFilters() {
      this.localFilters = this.normalizeFilters({})
      this.priceRange = ''
    },
    setSport(sportType) {
      this.localFilters.sportType = sportType
    },
    setBudget(range) {
      this.priceRange = range
      this.updatePrice()
    }
  }
}
</script>

<style scoped>
.filter-shell {
  --panel-bg: rgba(255, 255, 255, 0.94);
  --panel-border: rgba(191, 219, 254, 0.72);
  --text-main: #0f172a;
  --text-sub: #64748b;
  --brand-blue: #1d4ed8;
  --brand-sky: #0ea5e9;
  border-radius: 1.35rem;
  border: 1px solid var(--panel-border);
  padding: 1.1rem;
  background:
    radial-gradient(1000px 260px at 100% 0%, rgba(125, 211, 252, 0.16), transparent 60%),
    radial-gradient(860px 280px at 0% 100%, rgba(59, 130, 246, 0.1), transparent 55%),
    var(--panel-bg);
  box-shadow: 0 14px 38px rgba(2, 6, 23, 0.08);
  backdrop-filter: blur(6px);
}

.filter-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.filter-kicker {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  font-weight: 700;
  text-transform: uppercase;
  color: #0369a1;
}

.filter-title {
  margin: 0.3rem 0 0;
  font-size: clamp(1.45rem, 1.9vw, 1.95rem);
  line-height: 1.15;
  color: var(--text-main);
  font-weight: 800;
}

.filter-subtitle {
  margin: 0.4rem 0 0;
  color: var(--text-sub);
  max-width: 52rem;
  font-size: 0.91rem;
}

.clear-btn {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  border-radius: 999px;
  padding: 0.42rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.clear-btn:hover {
  border-color: #93c5fd;
  color: #0f172a;
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.16);
}

.filter-grid {
  margin-top: 0.95rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.filter-field {
  display: block;
}

.filter-wide {
  grid-column: 1 / -1;
}

.field-label {
  display: block;
  margin-bottom: 0.32rem;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.field-control {
  width: 100%;
  height: 2.65rem;
  border-radius: 0.78rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  padding: 0.55rem 0.76rem;
  color: #0f172a;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field-control:focus {
  border-color: var(--brand-sky);
  box-shadow: 0 0 0 4px rgba(125, 211, 252, 0.34);
}

.search-wrap {
  height: 2.65rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 0.78rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  padding: 0 0.72rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-wrap:focus-within {
  border-color: var(--brand-sky);
  box-shadow: 0 0 0 4px rgba(125, 211, 252, 0.34);
}

.search-icon {
  width: 1.15rem;
  height: 1.15rem;
  color: #94a3b8;
  flex-shrink: 0;
}

.search-control {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: #0f172a;
}

.search-control::placeholder {
  color: #94a3b8;
}

.quick-row {
  margin-top: 0.9rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.48rem;
}

.quick-label {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
}

.quick-chip {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  border-radius: 999px;
  padding: 0.36rem 0.72rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-chip:hover {
  border-color: #93c5fd;
  color: #1e3a8a;
}

.quick-chip-active {
  border-color: #60a5fa;
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-blue));
  color: #eff6ff;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.26);
}

@media (max-width: 960px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .filter-shell {
    border-radius: 1rem;
    padding: 0.88rem;
  }

  .filter-header {
    flex-direction: column;
    align-items: stretch;
  }

  .clear-btn {
    align-self: flex-start;
  }

  .filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
