import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import Season from '#models/season'

export default class Serie extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare tvg_logo: string

  @column()
  declare seasons: Array<Season>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
