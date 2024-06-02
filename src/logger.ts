
const log = (msg: string, ...params: any[]) => {
  const now = new Date().toISOString()
  console.log(now, msg, ...params)
}

const error = (msg: string, ...params: any[]) => {
  log('ERROR', msg, ...params)
}

export const logger = {
  log,
  error,
}