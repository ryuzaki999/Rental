import { createRouter, createWebHistory } from 'vue-router'

// สมมติว่ามีการสร้างไฟล์ Views เหล่านี้ไว้แล้ว หรือจะสร้างตามมาทีหลัง
// import HomeView from '../views/HomeView.vue'
// import FieldDetail from '../views/FieldDetail.vue'
// import BookingHistory from '../views/BookingHistory.vue'
// import AdminDashboard from '../views/admin/Dashboard.vue'

const routes = [
  // --- User / Customer Routes ---
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'), // หน้าค้นหาและกรอง (Search & Filter)
  },
  {
    path: '/field/:id',
    name: 'FieldDetail',
    component: () => import('../views/FieldDetail.vue'), // หน้าตารางเวลาและจอง (Dynamic Calendar & Booking)
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'), // หน้าชำระเงิน (Payment Gateway)
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/BookingHistory.vue'), // หน้าประวัติการจอง (Booking History)
  },

  // --- Admin / Owner Routes ---
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'), // แดชบอร์ดสรุปผล
  },
  {
    path: '/admin/schedule',
    name: 'AdminSchedule',
    component: () => import('../views/admin/ScheduleManage.vue'), // การจัดการตารางเวลา
  },
  {
    path: '/admin/inventory',
    name: 'AdminInventory',
    component: () => import('../views/admin/Inventory.vue'), // ระบบจัดการสต็อกอุปกรณ์
  },
  {
    path: '/admin/checkin',
    name: 'AdminCheckin',
    component: () => import('../views/admin/Checkin.vue'), // ระบบเช็คอิน QR Code
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// อาจเพิ่ม Navigation Guard ตรงนี้เพื่อตรวจสอบสิทธิ์ Admin
// router.beforeEach((to, from, next) => { ... })

export default router