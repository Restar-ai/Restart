import { api } from './client'

export function getHelloMessage() {
  return api.get('/hello')
}
