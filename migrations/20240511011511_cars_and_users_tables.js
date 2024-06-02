/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('cars', (table) => {
    table.increments('id')
    table.string('number', 64).unique().notNullable()
    table.boolean('has_multimedia').notNullable()
    table.string('reported_by', 64).notNullable()
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at', { useTz: true }).notNullable()
  })

  await knex.schema.createTable('users', (table) => {
    table.increments('id')
    table.string('telegram_id', 64).notNullable()
    table.string('state', 32).notNullable()
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at', { useTz: true }).notNullable()
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('users')
  await knex.schema.dropTableIfExists('cars')
};
