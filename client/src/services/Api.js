import axios from 'axios'
import { useAuthenStore } from '../stores/authen'

export default () => {
    const authenStore = useAuthenStore()
    
    return axios.create({
        baseURL: '/api',
        headers: {
            Authorization: `Bearer ${authenStore.token}`
        }
    })
}