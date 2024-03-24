import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'movies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').notNullable().primary()
      table.string('title').notNullable()
      table.string('stream_id').notNullable()
      table.string('poster').nullable()
      table.integer('category_id').notNullable()
      table.string('tmdb_id').notNullable()
      table.string('url').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
