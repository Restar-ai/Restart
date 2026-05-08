export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Route tidak ditemukan' })
}

export function errorHandler(err, _req, res, _next) {
  console.error(err)

  const statusCode = err.statusCode || 500
  const message = statusCode === 500
    ? 'Internal server error'
    : err.message

  res.status(statusCode).json({ message })
}
