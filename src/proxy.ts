import * as net from 'net'
import { parseData, proxyPort, serverPort } from './constants'

type ClientData = {
  id: string
  clientSocket: net.Socket
  serverSocket: net.Socket
}

const createServerSocket = (clientId: string, clientSocket: net.Socket) => {
  const serverSocket = net.createConnection({ port: serverPort })
  serverSocket.on('connect', () => {
    console.log('[PROXY] Connection with the server is established.')
  })
  // from server to client
  serverSocket.on('data', (data: Buffer) => {
    const response = parseData(data)
    const corruptedResponse = {
      success: `PROXY is here, success: [${response.success}]`,
    }
    console.log('[PROXY, SERVER -> CLIENT] Server response:', response)
    clientSocket.write(JSON.stringify(corruptedResponse))
  })
  serverSocket.on('error', () => {
    console.log(`[PROXY] Connection with the server is in error state for client: ${clientId}`)
  })
  serverSocket.on('close', () => {
    console.log(`[PROXY] Connection with the server is closed for client: ${clientId}`)
    clientSocket.end()
  })
  return serverSocket
}

const clientsMap = new Map<net.Socket, ClientData>()
const server = net.createServer(clientSocket => {
  const id = Number(new Date()).toString()
  console.log(`[PROXY] Client ${clientSocket.remoteAddress} is connected, and his id is [${id}]`)
  clientsMap.set(clientSocket, { id, clientSocket, serverSocket: createServerSocket(id, clientSocket) })

  // from client to server
  clientSocket.on('data', (data) => {
    const user = parseData(data)
    console.log('[PROXY, CLIENT -> SERVER]', { user })
    const { serverSocket } = clientsMap.get(clientSocket)
    const corruptedUser = {
      ...user,
      name: `This isn't a correct name [${user.name}]`,
    }
    serverSocket.write(JSON.stringify(corruptedUser))
  })
  clientSocket.on('error', () => {
    console.log(`[PROXY] Connection: ${clientsMap.get(clientSocket).id} is in error state.`)
  })
  clientSocket.on('close', () => {
    console.log(`[PROXY] Connection with client: ${clientsMap.get(clientSocket).id} is closed.`)
    const { serverSocket } = clientsMap.get(clientSocket)
    clientsMap.delete(clientSocket)
    serverSocket.end()
  })
})

server.listen(proxyPort, () => {
  console.log(`[PROXY] Server is listening on port ${proxyPort}`)
})
