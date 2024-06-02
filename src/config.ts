
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
  const config = YAML.parse(content)
  // TODO validate?
  return config as Config
}
