import Api from '@/services/Api'

export default {
  index (params = {}) {
    return Api().get('bookings', { params })
  },
  show (id) {
    return Api().get('booking/' + id)
  },
  post (payload) {
    return Api().post('booking', payload)
  },
  checkin (id) {
    return Api().post(`booking/${id}/checkin`)
  },
  put (payload) {
    return Api().put('booking/' + payload.id, payload)
  },
  delete (payload) {
    return Api().delete('booking/' + payload.id)
  },
  confirmPayment (bookingId) {
    return Api().post(`booking/${bookingId}/confirm-payment`)
  }
}
