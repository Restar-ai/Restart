// GET /api/hello
export function getHello(_req, res) {
  res.json({ message: 'Halo dari Express!' })
}

// POST /api/echo
export function postEcho(req, res) {
  const body = req.body
  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ message: 'Body tidak boleh kosong' })
  }
  res.json({ echo: body })
}