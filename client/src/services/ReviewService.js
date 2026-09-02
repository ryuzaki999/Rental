import Api from '@/services/Api'

export default {
  index (fieldId) {
    return Api().get('reviews', {
      params: {
        fieldId: fieldId
      }
    })
  },
  post (review) {
    return Api().post('review', review)
  }
}
