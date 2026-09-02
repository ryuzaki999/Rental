<template>
  <footer class="main-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <span class="dot dot-emerald"></span>
          <span class="dot dot-amber"></span>
          <span class="dot dot-sky"></span>
        </div>
        <p class="footer-title">SportRental</p>
        <p class="footer-text">
          แพลตฟอร์มสำหรับค้นหาและจองสนามกีฬาพร้อมอุปกรณ์เสริม
          ที่ออกแบบมาเพื่อให้ประสบการณ์การจองของคุณเรียบง่ายและชัดเจน
        </p>
      </div>

      <div class="footer-columns">
        <div class="footer-column">
          <h3>สำหรับผู้เล่น</h3>
          <ul>
            <li><router-link :to="{ name: 'home' }">หน้าแรก</router-link></li>
            <li><router-link :to="{ name: 'bookings' }">ประวัติการจอง</router-link></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>สำหรับเจ้าของสนาม</h3>
          <ul>
            <li><router-link :to="{ name: 'admin-dashboard' }">แดชบอร์ดจัดการสนาม</router-link></li>
            <li><span>จัดการตารางเวลา</span></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>ช่วยเหลือ</h3>
          <ul>
            <li><span>วิธีการใช้งานระบบ</span></li>
            <li><span>คำถามที่พบบ่อย</span></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© {{ new Date().getFullYear() }} SportRental. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'MainFooter'
}
</script>

<style scoped>
.main-footer {
  margin-top: 3rem;
  background: #0f172a;
  color: #e5e7eb;
}

.footer-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2.5rem 1rem 2rem;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 2fr);
  gap: 2.25rem;
}

.footer-brand {
  max-width: 360px;
}

.footer-logo {
  display: inline-flex;
  gap: 0.35rem;
  margin-bottom: 0.8rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.dot-emerald {
  background: #22c55e;
}
.dot-amber {
  background: #fbbf24;
}
.dot-sky {
  background: #38bdf8;
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', 'Sarabun', sans-serif;
  letter-spacing: 0.01em;
}

.footer-text {
  margin-top: 0.35rem;
  font-size: 0.88rem;
  line-height: 1.72;
  color: #9ca3af;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.footer-column h3 {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #e5e7eb;
  margin-bottom: 0.85rem;
  font-family: 'Plus Jakarta Sans', 'Sarabun', sans-serif;
}

.footer-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-column li {
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
}

.footer-column a,
.footer-column span {
  color: #9ca3af;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.footer-column a:hover,
.footer-column span:hover {
  color: #e5e7eb;
}

.footer-bottom {
  border-top: 1px solid rgba(55, 65, 81, 0.8);
  padding: 0.9rem 1rem 1.1rem;
  font-size: 0.78rem;
  color: #6b7280;
  text-align: center;
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: minmax(0, 1fr);
  }

  .footer-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .footer-columns {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
