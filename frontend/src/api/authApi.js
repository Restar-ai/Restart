import { api } from './client'

export async function registerUser(data) {

  return await api.post(
    '/auth/register',
    data
  )
}

export async function loginUser(data) {

  return await api.post(
    '/auth/login',
    data
  )
}

export async function logoutUser(userId) {
  return await api.post('/auth/logout', { user_id: userId })
}

export async function getProfile(userId) {
  return await api.get(`/auth/profile?user_id=${userId}`)
}