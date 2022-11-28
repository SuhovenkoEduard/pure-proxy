import * as net from 'net'
import { parseData, proxyPort } from './constants'
import { clearInterval } from 'timers'

const socket = net.createConnection({
  port: proxyPort,
})

socket.on('connect', () => {
  console.log('Connection with the server is established.')
})

socket.on('data', (data: Buffer) => {
  console.log('Server response:')
  console.dir(parseData(data))
})

socket.on('error', () => {
  console.log('Connection with the server is in error state.')
})

socket.on('close', () => {
  console.log('Connection with the server is closed.')
})

const names = ['Sergey', 'Stas', 'Edik', 'Oleg', 'Angelina', 'Liza', 'Ksyusha', 'Natasha']

const intervalId = setInterval(() => {
  if (socket.destroyed) {
    clearInterval(intervalId)
    return
  }
  socket.write(JSON.stringify({
    age: 16 + Math.floor(Math.random() * 16),
    name: names[Math.floor(Math.random() * names.length)],
  }))
}, 1000)

setTimeout(() => {
  clearInterval(intervalId)
}, 1000 * 60 * 3)
