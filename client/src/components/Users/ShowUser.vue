<template>
  <div>
    <h1>Show User</h1>

    <div v-if="user">
      <p>id: {{ user.id }}</p>
      <p>ชื่อ-นามสกุล: {{ user.name }} {{ user.lastname }}</p>
      <p>email: {{ user.email }}</p>
      <p>password: {{ user.password }}</p>
    </div>

    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script>
import UsersService from '../../services/UsersService'

export default {
  data () {
    return {
      userId: null, // id จาก URL
      user: null    // ข้อมูล user จาก backend
    }
  },

  mounted () {
    this.userId = this.$route.params.id
    this.fetchUser()
  },

  watch: {
    '$route.params.id'(newId) {
      this.userId = newId
      this.fetchUser()
    }
  },

  methods: {
    fetchUser () {
      UsersService.show(this.userId)
        .then(res => {
          console.log('API RESPONSE:', res.data)
          this.user = res.data
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>
