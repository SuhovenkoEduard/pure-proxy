import * as net from 'net'
import { parseData, serverPort } from './constants'

const clientsMap = new Map<net.Socket, string>()
const server = net.createServer(socket => {
  const id = Number(new Date()).toString()
  console.log(`Client ${socket.remoteAddress} is connected, and his id is [${id}]`)
  clientsMap.set(socket, id)

  socket.on('data', (data) => {
    const user = parseData(data)
    console.log(`ClientId: ${clientsMap.get(socket)}`, { user })
    socket.write(JSON.stringify({ success: true }))
  })
  socket.on('error', () => {
    console.log(`Connection: ${clientsMap.get(socket)} is in error state.`)
  })
  socket.on('close', () => {
    console.log(`Connection with client: ${clientsMap.get(socket)} is closed.`)
    clientsMap.delete(socket)
  })
})

server.listen(serverPort, () => {
  console.log(`Server is listening on port ${serverPort}`)
})
