
import { parseAddPlateNumbers, parseCheckPlateNumbers } from '../plate-number'

describe('parseAddPlateNumbers', () => {
  it('wrong input', () => {
    const text = 'тут ничего нет'
    const plateNumbers = parseAddPlateNumbers(text)
    expect(plateNumbers).toStrictEqual(undefined)
  })

  it('adding numbers', () => {
    const text = `
      PMX 295 есть
      NAY 443 нет
      PPE738 есть NNA368 нет
      какая то хрень
      NNA3 68 есть
    `
    const plateNumbers = parseAddPlateNumbers(text)
    expect(plateNumbers).toStrictEqual([
      { originalPlateNumber: 'PMX 295', plateNumber: 'PMX295', hasMultimedia: 'yes' },
      { originalPlateNumber: 'NAY 443', plateNumber: 'NAY443', hasMultimedia: 'no' },
      { originalPlateNumber: 'PPE738',  plateNumber: 'PPE738', hasMultimedia: 'yes' },
      { originalPlateNumber: 'NNA368',  plateNumber: 'NNA368', hasMultimedia: 'no' },
      { originalPlateNumber: 'NNA3 68',  plateNumber: 'NNA368', hasMultimedia: 'yes' },
    ])
  })

  it('check numbers', () => {
    const text = `
      PMX 295
      NAY 443 PPE738
      NNA368
      NNA3 68
    `
    const plateNumbers = parseCheckPlateNumbers(text)
    expect(plateNumbers).toStrictEqual([
      { originalPlateNumber: 'PMX 295', plateNumber: 'PMX295' },
      { originalPlateNumber: 'NAY 443', plateNumber: 'NAY443' },
      { originalPlateNumber: 'PPE738',  plateNumber: 'PPE738' },
      { originalPlateNumber: 'NNA368',  plateNumber: 'NNA368' },
      { originalPlateNumber: 'NNA3 68', plateNumber: 'NNA368' },
    ])
  })
})
