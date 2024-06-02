import type { Knex } from 'knex';

export type HasMultimedia = 'yes' | 'no' | 'unknown'

export type CheckCarInput = {
  originalPlateNumber: string
  plateNumber: string
}

export type CheckCarResult = {
  originalPlateNumber: string
  plateNumber: string
  hasMultimedia: HasMultimedia
}

export type AddCarInput = {
  cars: Array<{
    plateNumber: string
    hasMultimedia: Extract<HasMultimedia, 'yes' | 'no'>
  }>
  reporter: {
    telegramId: string
  }
}

type DbCar = {
  id: number
  number: string
  has_multimedia: boolean
  created_at: Date
  updated_at: Date
}

const mapHasMultimediaToDb = (hasMultimedia: Extract<HasMultimedia, 'yes' | 'no'>): boolean => {
  if (hasMultimedia === 'yes') {
    return true
  }
  if (hasMultimedia === 'no') {
    return false
  }
  throw new Error(`Unknown hasMultimedia: ${hasMultimedia}`)
}

export class CarsService {
  constructor (private readonly knex: Knex) {}

  async checkCarHasMultimedia(checkCars: CheckCarInput[]): Promise<CheckCarResult[]> {
    const plateNumbers = checkCars.map(({ plateNumber }) => plateNumber)

    const cars = await this.knex<DbCar>('cars')
      .select('number', 'has_multimedia')
      .whereIn('number', plateNumbers)

    const checkResults = checkCars.map(({ plateNumber, originalPlateNumber }): CheckCarResult => {
      const car = cars.find((car) => car.number === plateNumber)
      let hasMultimedia: HasMultimedia = 'unknown'
      if (car) {
        hasMultimedia = car.has_multimedia ? 'yes' : 'no'
      }
      return {
        originalPlateNumber,
        plateNumber,
        hasMultimedia,
      }
    })

    return checkResults
  }

  async addCarsHasMultimedia(input: AddCarInput): Promise<void> {
    const now = new Date()
    const values: string[] = []
    const parameters: unknown[] = []
    for (const { plateNumber, hasMultimedia } of input.cars) {
      values.push('(?, ?, ?, ?)')
      parameters.push(plateNumber)
      parameters.push(mapHasMultimediaToDb(hasMultimedia))
      parameters.push(input.reporter.telegramId)
      parameters.push(now)
    }

    const query = `
      insert into cars
        (number, has_multimedia, reported_by, updated_at)
      values
    ` + values.join(',') + `
      on conflict (number) do
        update set
          has_multimedia = excluded.has_multimedia,
          updated_at = now()`

    await this.knex.raw(query, parameters)
  }
}