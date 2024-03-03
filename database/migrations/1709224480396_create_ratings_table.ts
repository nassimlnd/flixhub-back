import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ratings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('profile_id').unsigned().references('profiles.id').onDelete('CASCADE')
      table.integer('media_id').unsigned()
      table.string('media_type', 10)
      table.float('rating', 2, 1)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
