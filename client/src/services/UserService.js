import Api from '@/services/Api'

export default {
  index (params = {}) {
    return Api().get('users', { params })
  },
  show (id) {
    return Api().get('user/' + id)
  },
  put (id, payload) {
    return Api().put('user/' + id, payload)
  },
  post (payload) {
    return Api().post('user', payload)
  },
  delete (id) {
    return Api().delete('user/' + id)
  }
}
