import type { Knex } from 'knex';

export enum State {
  CheckNumber = 'check_number',
  AddNumber = 'add_number',
}

export type User = {
  id: number
  telegram_id: string
  state: State
  created_at: Date
  updated_at: Date
}

export class UserService {
  constructor (private readonly knex: Knex) {}

  async getUserState(telegramId: string): Promise<State> {
    const users = await this.knex<User>('users')
      .select('id', 'state')
      .where({ telegram_id: telegramId })

    // All new users has default state, no need to save it to db
    if (users.length === 0) {
      return State.CheckNumber
    }

    return users[0].state
  }

  async changeUserState(telegramId: string, state: State): Promise<void> {
    await this.knex.transaction(async (trx) => {
      const [user] = await trx<User>('users')
        .update({ state }, ['id'])
        .where({ telegram_id: telegramId })
      if (user) {
        return
      }
      await trx<User>('users')
        .insert({
          telegram_id: telegramId,
          state,
          updated_at: new Date(),
        })
    })
  }
}