import Api from './Api'

export default {
  index () {
    return Api().get('users')
  },

  show (userId) {
    return Api().get('user/' + userId)
  },

  post (user) {
    return Api().post('user', user)
  },

  put (userId, user) {
    return Api().put('user/' + userId, user)
  },

  delete (userId) {
    return Api().delete('user/' + userId)
  }
}
