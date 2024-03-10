import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Serie from '#models/serie'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Season extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @belongsTo(() => Serie)
  declare serie_id: BelongsTo<typeof Serie>

  @column()
  declare season_number: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
