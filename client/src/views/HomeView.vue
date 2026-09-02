<template>
  <section class="home-hero">
    <div class="hero-content">
      <h1 class="hero-title">
        จองสนามกีฬาใกล้คุณได้ง่าย เร็ว และคุ้มค่า
      </h1>

      <p class="hero-subtitle">
        ค้นหา เปรียบเทียบราคา และดูรีวิวสนามจริงในหน้าเดียว พร้อมกรองตามประเภทกีฬา พื้นที่ และงบประมาณ
      </p>

      <ul class="hero-highlights" aria-label="จุดเด่นบริการ">
        <li class="highlight-item">
          <span class="check-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M4 10.5l3.2 3.2L16 5.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          ค้นหาสนามหลายพื้นที่ภายในไม่กี่วินาที
        </li>
        <li class="highlight-item">
          <span class="check-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M4 10.5l3.2 3.2L16 5.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          เปรียบเทียบราคาและรีวิวก่อนตัดสินใจ
        </li>
        <li class="highlight-item">
          <span class="check-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M4 10.5l3.2 3.2L16 5.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          กรองเงื่อนไขได้ละเอียดและใช้งานง่ายบนมือถือ
        </li>
      </ul>

      <form class="search-panel" @submit.prevent="search">
        <label class="segment">
          <span class="segment-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          <span class="segment-body">
            <span class="segment-label">ค้นหาสนาม</span>
            <input
              v-model.trim="searchForm.search"
              type="text"
              placeholder="ชื่อสนาม หรือคำค้นหา"
              autocomplete="off"
            />
          </span>
        </label>

        <label class="segment">
          <span class="segment-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8" />
              <path d="M12 3.5v17M3.5 12h17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          <span class="segment-body">
            <span class="segment-label">ประเภทกีฬา</span>
            <select v-model="searchForm.sportType">
              <option value="">ทุกประเภท</option>
              <option value="football">ฟุตบอล / ฟุตซอล</option>
              <option value="badminton">แบดมินตัน</option>
              <option value="basketball">บาสเกตบอล</option>
              <option value="tennis">เทนนิส</option>
              <option value="volleyball">วอลเลย์บอล</option>
            </select>
          </span>
        </label>

        <label class="segment">
          <span class="segment-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 21s6.5-5.3 6.5-11.2A6.5 6.5 0 0 0 5.5 9.8C5.5 15.7 12 21 12 21z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              <circle cx="12" cy="9.8" r="2.3" stroke="currentColor" stroke-width="1.8" />
            </svg>
          </span>
          <span class="segment-body">
            <span class="segment-label">พื้นที่</span>
            <input
              v-model.trim="searchForm.location"
              type="text"
              placeholder="เขต / จังหวัด"
              autocomplete="off"
            />
          </span>
        </label>

        <div class="segment segment-price">
          <span class="segment-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="12" rx="2.5" stroke="currentColor" stroke-width="1.8" />
              <circle cx="12" cy="12" r="2.2" stroke="currentColor" stroke-width="1.8" />
            </svg>
          </span>
          <span class="segment-body">
            <span class="segment-label">งบประมาณ (บาท/ชม.)</span>
            <span class="price-range">
              <input
                v-model.number="searchForm.minPrice"
                type="number"
                min="0"
                step="100"
                placeholder="ต่ำสุด"
              />
              <span class="range-sep">-</span>
              <input
                v-model.number="searchForm.maxPrice"
                type="number"
                min="0"
                step="100"
                placeholder="สูงสุด"
              />
            </span>
          </span>
        </div>

        <button class="search-button" type="submit" :disabled="isInvalidPriceRange">
          ค้นหาสนาม
        </button>
      </form>

      <p v-if="isInvalidPriceRange" class="error-text">
        กรุณาตรวจสอบช่วงราคา: ราคาต่ำสุดต้องน้อยกว่าหรือเท่ากับราคาสูงสุด
      </p>

      <div class="option-bar">
        <div class="option-group">
          <button
            type="button"
            class="quick-chip"
            :class="{ 'quick-chip-active': searchForm.sportType === 'football' }"
            @click="applySportPreset('football')"
          >
            ฟุตบอล
          </button>
          <button
            type="button"
            class="quick-chip"
            :class="{ 'quick-chip-active': searchForm.sportType === 'badminton' }"
            @click="applySportPreset('badminton')"
          >
            แบดมินตัน
          </button>
          <button
            type="button"
            class="quick-chip"
            :class="{ 'quick-chip-active': searchForm.sportType === 'basketball' }"
            @click="applySportPreset('basketball')"
          >
            บาสเกตบอล
          </button>
          <button
            type="button"
            class="quick-chip"
            :class="{ 'quick-chip-active': !searchForm.sportType }"
            @click="applySportPreset('')"
          >
            ทุกประเภท
          </button>
        </div>

        <button class="filters-link" type="button" @click="goToAllFields">
          <span class="filters-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
              <circle cx="8" cy="6" r="2.2" fill="currentColor" />
              <circle cx="15" cy="12" r="2.2" fill="currentColor" />
              <circle cx="13" cy="18" r="2.2" fill="currentColor" />
            </svg>
          </span>
          เปิดหน้าค้นหาทั้งหมด
        </button>
      </div>
    </div>
  </section>
</template>

<script>
const cleanNumber = (value) => {
  if (value === '' || value === null || value === undefined) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export default {
  name: 'HomeView',
  data() {
    return {
      searchForm: {
        search: '',
        sportType: '',
        location: '',
        minPrice: '',
        maxPrice: ''
      }
    }
  },
  computed: {
    isInvalidPriceRange() {
      const min = cleanNumber(this.searchForm.minPrice)
      const max = cleanNumber(this.searchForm.maxPrice)
      return min !== undefined && max !== undefined && min > max
    }
  },
  methods: {
    search() {
      if (this.isInvalidPriceRange) return

      const minPrice = cleanNumber(this.searchForm.minPrice)
      const maxPrice = cleanNumber(this.searchForm.maxPrice)

      this.$router.push({
        name: 'fields',
        query: {
          search: this.searchForm.search || undefined,
          sportType: this.searchForm.sportType || undefined,
          location: this.searchForm.location || undefined,
          min_price: minPrice !== undefined ? String(minPrice) : undefined,
          max_price: maxPrice !== undefined ? String(maxPrice) : undefined
        }
      })
    },
    applySportPreset(sport) {
      this.searchForm.sportType = sport
    },
    goToAllFields() {
      this.$router.push({ name: 'fields' })
    }
  }
}
</script>

<style scoped>
.home-hero {
  position: relative;
  overflow: hidden;
  margin-top: -0.75rem;
  min-height: clamp(32rem, 74vh, 42rem);
  padding: clamp(2rem, 4.5vw, 3.1rem) 1rem 2.4rem;
  font-family: "Sarabun", "Kanit", "Segoe UI", sans-serif;
  color: #ffffff;
  background: linear-gradient(130deg, #0a6db6 0%, #2d89d7 45%, #2f96e1 100%);
}

.home-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1000px 500px at 38% 20%, rgba(255, 255, 255, 0.23), transparent 57%),
    radial-gradient(1100px 500px at 86% -8%, rgba(255, 255, 255, 0.16), transparent 55%);
}

.home-hero::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 33%;
  background-image:
    linear-gradient(180deg, rgba(20, 108, 184, 0.08) 0%, rgba(8, 61, 107, 0.64) 100%),
    url("https://images.pexels.com/photos/2156/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=1800");
  background-size: cover;
  background-position: center;
  opacity: 0.52;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1320px;
  margin: 0 auto;
}

.hero-title {
  margin: 0;
  max-width: 58rem;
  font-size: clamp(1.85rem, 3.9vw, 3.65rem);
  line-height: 1.12;
  letter-spacing: 0.01em;
  font-weight: 800;
}

.hero-subtitle {
  margin: 0.85rem 0 0;
  max-width: 54rem;
  font-size: clamp(0.95rem, 1.35vw, 1.16rem);
  color: rgba(243, 248, 255, 0.92);
}

.hero-highlights {
  margin: 1rem 0 1.9rem;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1.2rem;
  font-size: clamp(0.92rem, 1.35vw, 1.02rem);
  font-weight: 500;
}

.highlight-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.32);
}

.check-icon svg {
  width: 0.95rem;
  height: 0.95rem;
}

.search-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.35fr) auto;
  align-items: stretch;
  overflow: hidden;
  border-radius: 0.82rem;
  border: 4px solid #f2b901;
  background: #ffffff;
  box-shadow: 0 18px 44px rgba(4, 54, 97, 0.42);
}

.segment {
  min-height: 5.5rem;
  padding: 0.6rem 0.82rem;
  display: flex;
  align-items: center;
  gap: 0.62rem;
  border-right: 1px solid #dce3eb;
  color: #0f172a;
}

.segment-icon {
  width: 1.45rem;
  height: 1.45rem;
  color: #5f6b7a;
  flex-shrink: 0;
}

.segment-body {
  display: block;
  width: 100%;
  min-width: 0;
}

.segment-label {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

.segment input,
.segment select {
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  line-height: 1.15;
  font-weight: 500;
  color: #111827;
  outline: none;
}

.segment select {
  cursor: pointer;
}

.segment input::placeholder {
  color: #64748b;
}

.segment-price {
  min-width: 14rem;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.price-range input {
  border-radius: 0.5rem;
  background: #f8fafc;
  padding: 0.42rem 0.5rem;
  border: 1px solid #d7e0ea;
  font-size: 0.95rem;
}

.range-sep {
  font-size: 0.9rem;
  color: #64748b;
}

.search-button {
  min-width: 9.8rem;
  border: none;
  background: #0e9f37;
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-button:hover {
  background: #07872d;
}

.search-button:disabled {
  background: #78c68f;
  cursor: not-allowed;
}

.error-text {
  margin: 0.55rem 0 0;
  font-size: 0.86rem;
  color: #fff1f1;
}

.option-bar {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.quick-chip {
  border: 1px solid rgba(255, 255, 255, 0.32);
  background: rgba(10, 77, 135, 0.7);
  color: #ffffff;
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.quick-chip:hover {
  background: rgba(8, 57, 99, 0.78);
}

.quick-chip-active {
  background: #ffffff;
  color: #0a68b1;
  border-color: #ffffff;
}

.filters-link {
  border: none;
  padding: 0.4rem 0.3rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  font-size: 1.08rem;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
}

.filters-icon {
  width: 1.42rem;
  height: 1.42rem;
}

@media (max-width: 1220px) {
  .search-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .segment {
    min-height: 4.45rem;
    border-right: 1px solid #dde3ea;
    border-bottom: 1px solid #dde3ea;
  }

  .search-button {
    grid-column: 1 / -1;
    min-height: 3.7rem;
  }
}

@media (max-width: 780px) {
  .home-hero {
    padding-top: 1.75rem;
    min-height: 36rem;
  }

  .hero-title {
    font-size: clamp(1.45rem, 8.1vw, 2.3rem);
    max-width: 100%;
  }

  .hero-subtitle {
    font-size: 0.94rem;
  }

  .hero-highlights {
    margin-bottom: 1.3rem;
  }

  .search-panel {
    grid-template-columns: minmax(0, 1fr);
  }

  .segment {
    border-right: none;
  }

  .option-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-link {
    padding-left: 0;
  }
}
</style>
