import Api from '@/services/Api'

export default {
  index (params = {}) {
    return Api().get('equipment', { params })
  },
  show (id) {
    return Api().get('equipment/' + id)
  },
  post (payload) {
    return Api().post('equipment', payload)
  },
  put (payload) {
    return Api().put('equipment/' + payload.id, payload)
  },
  delete (payload) {
    return Api().delete('equipment/' + payload.id)
  },
  adjustStock (id, delta) {
    return Api().post(`equipment/${id}/adjust-stock`, { delta })
  }
}
