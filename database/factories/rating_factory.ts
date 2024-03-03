import factory from '@adonisjs/lucid/factories'
import Rating from '#models/rating'
import db from '@adonisjs/lucid/services/db'

export const RatingFactory = factory
  .define(Rating, async ({ faker }) => {
    let profileId = await db.from('profiles').select('id').orderByRaw('RAND()').first()

    let movieId = await db
      .from('interactions')
      .select('media_id')
      .where('profile_id', profileId.id)
      .orderByRaw('RAND()')
      .first()

    let rating = faker.number.int({ min: 1, max: 5 })

    return {
      mediaId: movieId.media_id,
      profileId: profileId.id,
      rating: rating,
      mediaType: 'movie',
    }
  })
  .build()
