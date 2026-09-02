import Api from '@/services/Api'

export default {
  index (params = {}) {
    return Api().get('admin/audits', { params })
  }
}
