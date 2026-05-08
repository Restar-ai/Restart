import { createEchoResponse, getHelloMessage } from '../services/helloService.js'

export function getHello(_req, res) {
  res.json(getHelloMessage())
}

export function postEcho(req, res) {
  res.json(createEchoResponse(req.body))
}
