import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Movie from '#models/movie'
import Profile from '#models/profile'

export default class List extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profile_id: number

  @column()
  declare movie_id: number

  @hasMany(() => Movie)
  declare movies: HasMany<typeof Movie>

  @hasMany(() => Profile)
  declare profiles: HasMany<typeof Profile>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
