<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">เข้าสู่ระบบ</h1>
      <p class="login-subtitle">
        เข้าสู่ระบบเพื่อจองสนาม หรือจัดการข้อมูลสำหรับเจ้าของสนาม
      </p>

      <form class="login-form" @submit.prevent="onLogin">
        <label class="field">
          <span class="field-label">อีเมล</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="field-input"
          />
        </label>

        <label class="field">
          <span class="field-label">รหัสผ่าน</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="field-input"
          />
        </label>

        <button type="submit" class="login-button">
          เข้าสู่ระบบ
        </button>

        <p class="register-hint">
          ยังไม่มีบัญชี?
          <router-link :to="{ name: 'register' }" class="register-link">
            สมัครสมาชิก
          </router-link>
        </p>

        <p v-if="error" class="error">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import AuthenService from '@/services/AuthenService'
import { useAuthenStore } from '@/stores/authen'

export default {
  data() {
    return {
      email: '',
      password: '',
      error: null
    }
  },
  methods: {
    async onLogin() {
      try {
        const response = await AuthenService.login({
          email: this.email,
          password: this.password
        })

        const authenStore = useAuthenStore()
        authenStore.setToken(response.data.token)
        authenStore.setUser(response.data.user)

        const role = response.data.user?.role
        const redirectPath = typeof this.$route.query.redirect === 'string'
          ? this.$route.query.redirect
          : ''

        if (redirectPath && redirectPath.startsWith('/')) {
          this.$router.push(redirectPath)
        } else if (role === 'admin') {
          this.$router.push({ name: 'admin-dashboard' })
        } else {
          this.$router.push({ name: 'home' })
        }
      } catch (error) {
        console.log(error)
        this.error = error?.response?.data?.error || 'ไม่สามารถเข้าสู่ระบบได้'
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.login-card {
  max-width: 420px;
  width: 100%;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.18);
  padding: 1.75rem 1.75rem 1.9rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.login-subtitle {
  margin-top: 0.35rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.login-form {
  margin-top: 1.2rem;
  display: grid;
  gap: 0.85rem;
}

.field {
  display: grid;
  gap: 0.3rem;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4b5563;
}

.field-input {
  border-radius: 0.9rem;
  border: 1px solid #d1d5db;
  padding: 0.6rem 0.8rem;
  font-size: 0.9rem;
  color: #111827;
}

.field-input:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 1px;
  border-color: #0ea5e9;
}

.login-button {
  margin-top: 0.5rem;
  border-radius: 999px;
  border: none;
  padding: 0.65rem 1rem;
  background: linear-gradient(135deg, #0ea5e9, #1d4ed8);
  color: #eff6ff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 14px 32px rgba(37, 99, 235, 0.55);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.68);
  background: linear-gradient(135deg, #0284c7, #1d4ed8);
}

.error {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #dc2626;
}

.register-hint {
  margin-top: 0.6rem;
  font-size: 0.8rem;
  color: #4b5563;
}

.register-link {
  font-weight: 600;
  color: #0ea5e9;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
