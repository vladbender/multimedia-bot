
import { Telegraf, Context, NarrowedContext } from 'telegraf'
import { Update } from '@telegraf/types' // Что за треш у них с типами

import type { Config } from '../config'
import { type CarsService, type UserService, State } from '../services'
import { parseAddPlateNumbers, parseCheckPlateNumbers } from '../parsers'
import { logger } from '../logger'

import {
  startMessage,
  addNumbersMessage,
  successfulAddingMessage,
  createCheckMessage,
  createStatMessage,
  noPlateNumbersInAddMessage,
  noPlateNumbersInCheckMessage,
} from './messages'
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
    bot.command('stat', (ctx) => this.onStat(ctx))

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
    await ctx.replyWithMarkdownV2(startMessage, addMarkup)
  }

  private async onStat(ctx: NarrowedContext<Context<Update>, Update.MessageUpdate>): Promise<void> {
    const telegramId = ctx.update.message.from.id
    if (!this.config.admin_ids.includes(telegramId)) {
      return
    }
    const usersStat = await this.userService.getStat()
    const carsStat = await this.carsService.getStat()
    await ctx.reply(createStatMessage(usersStat, carsStat))
  }

  private async onMessage(ctx: NarrowedContext<Context<Update>, Update.MessageUpdate>): Promise<void> {
    const telegramId = String(ctx.update.message.from.id)
    const username = ctx.update.message.from.username
    const text = (ctx.text ?? '').replace(/\n/g, ' ')

    logger.log(`NEW_MESSAGE telegramId=${telegramId} username=${username} text="${text}"`)

    const userState = await this.userService.getUserState(telegramId)

    // TODO отдельные хендлеры
    if (userState === State.CheckNumber) {
      const plateNumbers = parseCheckPlateNumbers(ctx.text)
      if (plateNumbers === undefined) {
        await ctx.reply(noPlateNumbersInCheckMessage)
        return
      }
      const statuses = await this.carsService.checkCarHasMultimedia(plateNumbers)
      const message = createCheckMessage(statuses)
      await ctx.reply(message, addMarkup)
    } else if (userState === State.AddNumber) {
      const plateNumbers = parseAddPlateNumbers(ctx.text)
      if (plateNumbers === undefined) {
        await ctx.reply(noPlateNumbersInAddMessage)
        return
      }
      await this.carsService.addCarsHasMultimedia({
        cars: plateNumbers,
        reporter: {
          telegramId
        }
      })
      await this.userService.changeUserState(telegramId, State.CheckNumber)
      await ctx.reply(successfulAddingMessage)
    }
  }

  private async onAddNumberButton(ctx: Context<Update.CallbackQueryUpdate>): Promise<void> {
    const telegramId = String(ctx.chat?.id)
    const username = ctx.update.callback_query.from.username

    logger.log(`onAddNumberButton telegramId=${telegramId} username=${username}`)

    if (telegramId === undefined) {
      logger.error('onAddNumberButton no telegramId', ctx)
      return
    }
    await this.userService.changeUserState(telegramId, State.AddNumber)
    await ctx.replyWithMarkdownV2(addNumbersMessage, backToMenuMarkup)
  }

  private async onBackToMainMenuButton(ctx: Context<Update.CallbackQueryUpdate>): Promise<void> {
    const telegramId = String(ctx.chat?.id)
    const username = ctx.update.callback_query.from.username

    logger.log(`onBackToMainMenuButton telegramId=${telegramId} username=${username}`)

    if (telegramId === undefined) {
      logger.error('onBackToMainMenuButton no telegramId', ctx)
      return
    }
    await this.userService.changeUserState(telegramId, State.CheckNumber)
    await ctx.replyWithMarkdownV2(startMessage, addMarkup)
  }
}
