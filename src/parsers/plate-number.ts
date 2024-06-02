
const addRegexp = /([A-ZА-ЯË]{3} ?[0-9]{3}) (есть|нет)/gi
const checkRegexp = /([A-ZА-ЯË]{3} ?[0-9]{3})/gi

export const parseAddPlateNumbers = (input: string | undefined) => {
  if (!input) {
    return
  }

  const result = []
  for (const match of input.matchAll(addRegexp)) {
    const plateNumber = match[1]
    const hasMultimedia = mapHasMultimedia(match[2])
    result.push({
      originalPlateNumber: plateNumber,
      plateNumber: normalizePlateNumber(plateNumber),
      hasMultimedia,
    })
  }

  if (result.length === 0) {
    return
  }

  return result
}

export const parseCheckPlateNumbers = (input: string | undefined) => {
  if (!input) {
    return
  }

  const result = []
  for (const match of input.matchAll(checkRegexp)) {
    const plateNumber = match[1]
    result.push({
      originalPlateNumber: plateNumber,
      plateNumber: normalizePlateNumber(plateNumber),
    })
  }

  if (result.length === 0) {
    return
  }

  return result
}

const map: Record<string, string> = {
  // russian to english
  'А': 'A',
  'В': 'B',
  'Е': 'E',
  'К': 'K',
  'М': 'M',
  'Н': 'H',
  'О': 'O',
  'Р': 'P',
  'С': 'C',
  'Т': 'T',
  'У': 'Y',
  'Х': 'X',
}

const normalizePlateNumber = (from: string): string => {
  const result = []
  for (const char of from) {
    if (char === ' ') {
      continue
    }
    const upper = char.toUpperCase()

    result.push(map[upper] ?? upper)
  }

  return result.join('')
}

const mapHasMultimedia = (s: string): 'yes' | 'no' => {
  const lower = s.toLowerCase()
  if (lower === 'есть') {
    return 'yes'
  }
  if (lower === 'нет') {
    return 'no'
  }
  throw new Error(`Unknown has_multimedia: ${s}`)
}
