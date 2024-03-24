import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'episodes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.integer('episode_num').notNullable()
      // table.integer('season_id').notNullable()
      table.integer('season_number').notNullable()
      table.integer('serie_id').notNullable()
      table.string('url').notNullable()
      table.string('poster').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
