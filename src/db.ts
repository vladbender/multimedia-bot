import Knex from 'knex'
import type { Config } from './config'
import { logger } from './logger'

export const initKnex = (config: Config): Knex.Knex => {
  const knex = Knex({
    client: 'pg',
    connection: {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
    },
  })

  if (config.db.print_queries) {
    knex.on('query', (query) => {
      logger.log('KNEX_QUERY', query?.sql)
    })
  }

  return knex
}