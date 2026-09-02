<template>
  <div>
    <h1>Edit User</h1>

    <form @submit.prevent="editUser">
      <p>
        name:
        <input type="text" v-model="user.name" />
      </p>

      <p>
        lastname:
        <input type="text" v-model="user.lastname" />
      </p>

      <p>
        email:
        <input type="text" v-model="user.email" />
      </p>

      <p>
        password:
        <input type="text" v-model="user.password" />
      </p>

      <p>
        <button type="submit">edit user</button>
      </p>
    </form>
  </div>
</template>

<script>
import UsersService from '../../services/UsersService'

export default {
  data () {
    return {
      userId: null,
      user: {
        name: '',
        lastname: '',
        email: '',
        password: '',
        status: 'active'
      }
    }
  },

  async created () {
    try {
      this.userId = this.$route.params.id   // ✅ ตรงกับ router
      this.user = (await UsersService.show(this.userId)).data
    } catch (error) {
      console.log(error)
    }
  },

  methods: {
    async editUser () {
      try {
        await UsersService.put(this.userId, this.user) // ✅ ส่ง id ชัดเจน
        this.$router.push({ name: 'users' })
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style scoped>
</style>
