<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">สมัครสมาชิกใหม่</h1>
      <p class="register-subtitle">
        สร้างบัญชีเพื่อเริ่มต้นจองสนามกีฬาและติดตามประวัติการใช้งานของคุณ
      </p>

      <form class="register-form" @submit.prevent="onRegister">
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">ชื่อ</span>
            <input
              v-model="form.name"
              type="text"
              autocomplete="given-name"
              required
              class="field-input"
            />
          </label>

          <label class="field">
            <span class="field-label">นามสกุล</span>
            <input
              v-model="form.lastname"
              type="text"
              autocomplete="family-name"
              required
              class="field-input"
            />
          </label>
        </div>

        <label class="field">
          <span class="field-label">อีเมล</span>
          <input
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            class="field-input"
          />
        </label>

        <label class="field">
          <span class="field-label">รหัสผ่าน</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            minlength="6"
            required
            class="field-input"
          />
        </label>

        <label class="field">
          <span class="field-label">ยืนยันรหัสผ่าน</span>
          <input
            v-model="form.passwordConfirm"
            type="password"
            autocomplete="new-password"
            minlength="6"
            required
            class="field-input"
          />
        </label>

        <p v-if="error" class="error">
          {{ error }}
        </p>
        <p v-if="success" class="success">
          {{ success }}
        </p>

        <button type="submit" class="register-button">
          สร้างบัญชี
        </button>

        <p class="login-hint">
          มีบัญชีอยู่แล้ว?
          <router-link :to="{ name: 'login' }" class="login-link">
            เข้าสู่ระบบ
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import AuthenService from '@/services/AuthenService'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        name: '',
        lastname: '',
        email: '',
        password: '',
        passwordConfirm: ''
      },
      error: null,
      success: null,
      loading: false
    }
  },
  methods: {
    async onRegister() {
      this.error = null
      this.success = null

      if (this.form.password !== this.form.passwordConfirm) {
        this.error = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน'
        return
      }

      try {
        this.loading = true
        await AuthenService.register({
          name: this.form.name,
          lastname: this.form.lastname,
          email: this.form.email,
          password: this.form.password
        })
        this.success = 'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ'
        setTimeout(() => {
          this.$router.push({ name: 'login' })
        }, 800)
      } catch (err) {
        console.error(err)
        this.error =
          err?.response?.data?.error ||
          'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.register-card {
  max-width: 460px;
  width: 100%;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.2);
  padding: 1.9rem 1.9rem 2.1rem;
}

.register-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
}

.register-subtitle {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.register-form {
  margin-top: 1.2rem;
  display: grid;
  gap: 0.85rem;
}

.grid-2 {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  outline: 2px solid #22c55e;
  outline-offset: 1px;
  border-color: #22c55e;
}

.register-button {
  margin-top: 0.5rem;
  border-radius: 999px;
  border: none;
  padding: 0.7rem 1rem;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ecfdf5;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 16px 40px rgba(22, 163, 74, 0.55);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.register-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 50px rgba(22, 163, 74, 0.7);
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.error {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: #dc2626;
}

.success {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: #16a34a;
}

.login-hint {
  margin-top: 0.75rem;
  font-size: 0.82rem;
  color: #4b5563;
}

.login-link {
  font-weight: 600;
  color: #16a34a;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .register-card {
    padding-inline: 1.4rem;
  }

  .grid-2 {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

