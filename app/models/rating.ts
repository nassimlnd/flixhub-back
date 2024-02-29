import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Profile from '#models/profile'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Rating extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profileId: number

  @column()
  declare mediaId: number

  @column()
  declare mediaType: string

  @column()
  declare rating: number

  @belongsTo(() => Profile)
  declare profile: BelongsTo<typeof Profile>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
