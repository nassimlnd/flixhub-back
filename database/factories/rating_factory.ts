import factory from '@adonisjs/lucid/factories'
import Rating from '#models/rating'
import db from '@adonisjs/lucid/services/db'

export const RatingFactory = factory
  .define(Rating, async ({ faker }) => {
    let profile = await db.from('interactions').select('profile_id').orderByRaw('RAND()').first()
    //let interests = JSON.parse(profile.interests)
    //let interestsIndex = faker.number.int({ min: 0, max: interests.length - 1 })

    let movieId = await db
      .from('interactions')
      .select('media_id')
      .where('profile_id', profile.profile_id)
      .orderByRaw('RAND()')
      .first()

    let rating = faker.number.int({ min: 1, max: 5 })

    /*let randomMovie = await db
      .from('movies')
      .select('id')
      .where('group_title', interests[interestsIndex])
      .orderByRaw('RAND()')
      .first()*/

    return {
      mediaId: movieId.media_id,
      profileId: profile.profile_id,
      rating: rating,
      mediaType: 'movie',
    }
  })
  .build()
