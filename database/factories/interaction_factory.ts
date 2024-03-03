import factory from '@adonisjs/lucid/factories'
import Interaction from '#models/interaction'
import db from '@adonisjs/lucid/services/db'

export const InteractionFactory = factory
  .define(Interaction, async () => {
    let profile = await db.from('profiles').orderByRaw('RAND()').first()
    let interests = JSON.parse(profile.interests)

    let movie = await db
      .from('movies')
      .where('group_title', interests[0])
      .orderByRaw('RAND()')
      .first()

    return {
      profileId: profile.id,
      mediaId: movie.id,
      interactionType: 'view',
      mediaType: 'movie',
    }
  })
  .build()
