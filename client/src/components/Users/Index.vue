<template>
  <div>
    <!-- ⭐ ปุ่ม Logout -->
    <p>
      <button v-on:click="logout">Logout</button>
    </p>

    <h1>Get All Users</h1>

    <div>จำนวนผู้ใช้งาน {{ users.length }}</div>

    <div v-if="users.length > 0">
      <div
        v-for="user in users"
        :key="user.id"
        style="margin-bottom: 15px;"
      >
        <div>id: {{ user.id }}</div>
        <div>ชื่อ-นามสกุล: {{ user.name }} {{ user.lastname }}</div>
        <div>email: {{ user.email }}</div>
        <div>status: {{ user.status }}</div>
        <div>type: {{ user.type }}</div>

        <!-- ⭐ ปุ่มเดิมทั้งหมด -->
        <p>
          <button v-on:click="navigateTo('/user/' + user.id)">
            ดูข้อมูลผู้ใช้
          </button>

          <button v-on:click="navigateTo('/user/edit/' + user.id)">
            แก้ไขข้อมูล
          </button>

          <button v-on:click="deleteUser(user)">
            ลบข้อมูล
          </button>
        </p>

        <hr />
      </div>
    </div>

    <div v-else>
      ยังไม่มีข้อมูลผู้ใช้งาน
    </div>
  </div>
</template>

<script>
import UsersService from '../../services/UsersService'
import { useAuthenStore } from '../../stores/authen'

export default {
  data () {
    return {
      users: []
    }
  },

  async created () {
    this.users = (await UsersService.index()).data
  },

  methods: {
    navigateTo (route) {
      this.$router.push(route)
    },

    // ⭐ ลบผู้ใช้ (ของเดิม)
    async deleteUser (user) {
      let result = confirm('Want to delete?')
      if (result) {
        try {
          await UsersService.delete(user)
          this.refreshData()
        } catch (err) {
          console.log(err)
        }
      }
    },

    // ⭐ โหลดข้อมูลใหม่ (ของเดิม)
    async refreshData () {
      this.users = (await UsersService.index()).data
    },

    // ⭐ Logout (เพิ่มใหม่)
    logout () {
      const authenStore = useAuthenStore()
      authenStore.logout()   // ล้าง token + user

      this.$router.push({
        name: 'login'
      })
    }
  }
}
</script>
