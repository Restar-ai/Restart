export function getHelloMessage() {
  return { message: 'Halo dari Express!' }
}

export function createEchoResponse(body) {
  if (!body || Object.keys(body).length === 0) {
    const error = new Error('Body tidak boleh kosong')
    error.statusCode = 400
    throw error
  }

  return { echo: body }
}
