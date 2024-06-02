
import { getConfig } from './config'
import { CarsService, UserService } from './services'
import { initKnex } from './db'
import { Bot } from './bot'

const main = async () => {
  const config = getConfig()

  const knex = initKnex(config)

  const userService = new UserService(knex)
  const carsService = new CarsService(knex)

  const bot = new Bot(
    config,
    userService,
    carsService
  )

  await bot.run()
}

main()
  .catch(console.error)