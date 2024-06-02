
const path = require('node:path')
const fs = require('node:fs')

const yaml = require('yaml')

const content = fs.readFileSync(path.join(__dirname, '../config.yml'), { encoding: 'utf-8' })
const config = yaml.parse(content)

module.exports = {
  client: 'pg',
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations',
  }
};
