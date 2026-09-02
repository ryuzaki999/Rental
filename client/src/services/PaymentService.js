import Api from '@/services/Api'

export default {
  create (paymentInfo) {
    return Api().post('payment/create', paymentInfo)
  },
  status (bookingId) {
    return Api().get(`payment/${bookingId}/status`)
  }
}
