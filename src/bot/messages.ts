
import type { HasMultimedia, CheckCarResult } from '../services'

export const startMessage = `
Пришлите один или несколько номеров на проверку, например:

PMX295
PPE 738

Или нажмите "Добавить номера" если хотите внести новые номера в память бота.
`.trim()

export const addNumbersMessage = `
Пришлите один или несколько номеров, которые нужно добавить. Рядом напишите есть ли там блютуз или нет. Например:

PMX 295 есть
PPE 738 есть
MHE 143 нет

Или нажмите "Назад" если хотите вернуться к проверке номеров.
`.trim()

export const successfulAddingMessage = `
Номера успешно добавлены
`.trim()

export const noPlateNumbersMessage = `
К сожалению, я не нашел номеров в вашем сообщении 😥
`.trim()

const mapHasMultimedia: Record<HasMultimedia, string> = {
  'yes': 'имеет блютуз',
  'no': 'не имеет блютуз',
  'unknown': 'нет информации',
}

export const createCheckMessage = (checkCarResult: CheckCarResult[]): string => {
  return checkCarResult
    .map(({ originalPlateNumber, hasMultimedia }) => `${originalPlateNumber} ${mapHasMultimedia[hasMultimedia]}`)
    .join('\n')
}
