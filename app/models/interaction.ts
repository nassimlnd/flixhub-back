import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Profile from '#models/profile'

export default class Interaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profileId: number

  @column()
  declare mediaId: number

  @column()
  declare mediaType: string

  @column()
  declare interactionType: string

  @belongsTo(() => Profile)
  declare profile: BelongsTo<typeof Profile>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
