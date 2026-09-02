import Api from '@/services/Api'

export default {
  index (params = {}) {
    return Api().get('fields', { params })
  },
  show (fieldId) {
    return Api().get('field/' + fieldId)
  },
  post (field) {
    return Api().post('field', field)
  },
  upload (formData) {
    return Api().post('field-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  deleteUpload (pathObj) {
    return Api().delete('field-upload', { data: pathObj })
  },
  put (field) {
    return Api().put('field/' + field.id, field)
  },
  delete (field) {
    return Api().delete('field/' + field.id)
  },
  getAvailability (fieldId, params) {
    return Api().get('field/' + fieldId + '/availability', { params })
  }
}
