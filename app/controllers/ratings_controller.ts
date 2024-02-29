import Rating from '#models/rating'
import type { HttpContext } from '@adonisjs/core/http'

export default class RatingsController {
  async registerRating({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized()
    }

    const { profileId, mediaId, mediaType, rating } = request.only([
      'profileId',
      'mediaId',
      'mediaType',
      'rating',
    ])

    // Check if profileId is valid and belongs to the user
    const profile = await user.related('profiles').query().where('id', profileId).first()

    if (!profile) {
      return response.notFound('Profile not found')
    }

    // Register rating
    const ratingObject = new Rating()
    ratingObject.profileId = profileId
    ratingObject.mediaId = mediaId
    ratingObject.mediaType = mediaType
    ratingObject.rating = rating

    await ratingObject.related('profile').associate(profile)

    await ratingObject.save()

    console.log(
      '[DEBUG] User ',
      user.email,
      'with profile',
      profile.name,
      'registered a rating',
      rating,
      'for media',
      mediaId,
      'of type',
      mediaType
    )

    return response.status(201).json(ratingObject)
  }
}
