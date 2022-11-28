export const proxyPort = 8080
export const serverPort = 3000

export const parseData = (buffer: Buffer) => {
  return JSON.parse(buffer.toString())
}
