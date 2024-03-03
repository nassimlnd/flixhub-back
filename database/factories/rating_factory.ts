import factory from '@adonisjs/lucid/factories'
import Rating from '#models/rating'
import db from '@adonisjs/lucid/services/db'

export const RatingFactory = factory
  .define(Rating, async ({ faker }) => {
    let groupTitle = await db.from('movies').select('group_title').orderByRaw('RAND()').first()
    let movieId = await db
      .from('movies')
      .select('id')
      .where('group_title', groupTitle.group_title)
      .orderByRaw('RAND()')
      .first()
    let profileId = await db.from('profiles').select('id').orderByRaw('RAND()').first()
    let rating = faker.number.int({ min: 1, max: 5 })

    return {
      mediaId: movieId,
      profileId: profileId.id,
      rating: rating,
      mediaType: 'movie',
    }
  })
  .build()
