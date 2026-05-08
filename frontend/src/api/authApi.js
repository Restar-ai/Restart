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