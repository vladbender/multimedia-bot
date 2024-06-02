
import { Telegraf, Context, NarrowedContext } from 'telegraf'
import { Update } from '@telegraf/types' // Что за треш у них с типами

import type { Config } from '../config'
import { type CarsService, type UserService, State } from '../services'
import { parseAddPlateNumbers, parseCheckPlateNumbers } from '../parsers'
import { logger } from '../logger'

import { addNumbersMessage, startMessage, successfulAddingMessage, createCheckMessage, noPlateNumbersMessage } from './messages'
import { Button } from './button'
import { addMarkup, backToMenuMarkup } from './markups'

export class Bot {
  constructor(
    private readonly config: Config,
    private readonly userService: UserService,
    private readonly carsService: CarsService,
  ) {}

  async run(): Promise<void> {
    const bot = new Telegraf(this.config.telegram.token)

    bot.command('start', (ctx) => this.onStart(ctx))

    bot.on('message', (ctx) => this.onMessage(ctx))

    bot.action(Button.AddNumber, (ctx) => this.onAddNumberButton(ctx))
    bot.action(Button.BackToMainMenu, (ctx) => this.onBackToMainMenuButton(ctx))

    bot.catch(async (err, ctx) => {
      logger.error('BOT_CATCH_ERROR', err)
      if (this.config.debug) {
        await ctx.reply('Happened error:\n' + err)
      }
    })

    process.once('SIGINT', () => {
      logger.log('Cought SIGINT')
      bot.stop('SIGINT')
    })
    process.once('SIGTERM', () => {
      logger.log('Cought SIGTERM')
      bot.stop('SIGTERM')
    })

    await bot.launch(() => {
      logger.log('Bot started')
    })
  }

  private async onStart(ctx: Context): Promise<void> {
    await ctx.reply(startMessage, addMarkup)
  }

  private async onMessage(ctx: NarrowedContext<Context<Update>, Update.MessageUpdate>): Promise<void> {
    const telegramId = String(ctx.update.message.from.id)

    logger.log(`NEW_MESSAGE telegramId=${telegramId} username=${ctx.update.message.from.username} text="${(ctx.text ?? '').replace(/\n/g, ' ')}"`)

    const userState = await this.userService.getUserState(telegramId)

    if (userState === State.CheckNumber) {
      const plateNumbers = parseCheckPlateNumbers(ctx.text)
      if (plateNumbers === undefined) {
        await ctx.reply(noPlateNumbersMessage)
        return
      }
      const statuses = await this.carsService.checkCarHasMultimedia(plateNumbers)
      const message = createCheckMessage(statuses)
      await ctx.reply(message, addMarkup)
    } else if (userState === State.AddNumber) {
      const plateNumbers = parseAddPlateNumbers(ctx.text)
      if (plateNumbers === undefined) {
        await ctx.reply(noPlateNumbersMessage)
        return
      }
      await this.carsService.addCarsHasMultimedia({
        cars: plateNumbers,
        reporter: {
          telegramId
        }
      })
      await ctx.reply(successfulAddingMessage, backToMenuMarkup)
    }
  }

  private async onAddNumberButton(ctx: Context): Promise<void> {
    const telegramId = String(ctx.chat?.id)

    logger.log(`onAddNumberButton telegramId=${telegramId}`)

    if (telegramId === undefined) {
      logger.error('onAddNumberButton no telegramId', ctx)
      return
    }
    await this.userService.changeUserState(telegramId, State.AddNumber)
    await ctx.reply(addNumbersMessage, backToMenuMarkup)
  }

  private async onBackToMainMenuButton(ctx: Context): Promise<void> {
    const telegramId = String(ctx.chat?.id)

    logger.log(`onBackToMainMenuButton telegramId=${telegramId}`)

    if (telegramId === undefined) {
      logger.error('onBackToMainMenuButton no telegramId', ctx)
      return
    }
    await this.userService.changeUserState(telegramId, State.CheckNumber)
    await ctx.reply(startMessage, addMarkup)
  }
}
