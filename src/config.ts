
import { join } from 'node:path'
import { readFileSync } from 'node:fs'

import YAML from 'yaml'

export type Config = {
  debug: boolean
  telegram: {
    token: string
  }
  db: {
    print_queries: boolean
    host: string
    port: number
    user: string
    password: string
    database: string
  }
  admin_ids: number[]
}

let config: Config | undefined

export const getConfig = (): Config => {
  if (config === undefined) {
    config = loadConfig()
  }
  return config
}

const loadConfig = (): Config => {
  const content = readFileSync(join(__dirname, '../config.yml'), { encoding: 'utf-8' })
  const config: Config = YAML.parse(content)
  // TODO validate?
  if (!config.admin_ids) {
    config.admin_ids = []
  }
  return config
}
