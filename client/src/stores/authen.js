import { defineStore } from 'pinia'

export const useAuthenStore = defineStore('authen', {
  state: () => ({
    token: null,
    user: null
  }),
  getters: {
    isUserLoggedIn: (state) => !!state.token
  },
  actions: {
    setToken(token) {
      this.token = token
    },
    setUser(user) {
      this.user = user
    },
    logoutUser() {
      this.token = null
      this.user = null
    }
  },
  persist: true // บันทึกลง Local Storage อัตโนมัติ
})