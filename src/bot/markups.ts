import { Markup } from 'telegraf'
import { Button } from './button'

export const addMarkup = Markup.inlineKeyboard([
  Markup.button.callback('Добавить номера', Button.AddNumber)
])

export const backToMenuMarkup = Markup.inlineKeyboard([
  Markup.button.callback('Проверить номера', Button.BackToMainMenu)
])