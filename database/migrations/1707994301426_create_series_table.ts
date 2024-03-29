import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'series'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').notNullable().primary()
      table.string('title').notNullable()
      table.string('poster').notNullable()
      table.integer('category_id').nullable()
      table.integer('serie_id').unique().notNullable()
      table.integer('tmdb_id').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
