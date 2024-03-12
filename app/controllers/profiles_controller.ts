import type { HttpContext } from '@adonisjs/core/http'
import Profile from '#models/profile'
import Interaction from '#models/interaction'
import { userSimilarity } from '#services/recommandation_service'

export default class ProfilesController {
  async createProfile({ auth, request, response }: HttpContext) {
    const user = auth.user
    let movieInterests: string
    let serieInterests: string

    const { name, avatar, birthdate, haveMovieInterests, haveSerieInterests } = request.only([
      'name',
      'avatar',
      'birthdate',
      'haveMovieInterests',
      'haveSerieInterests',
    ])

    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    if (haveMovieInterests) {
      movieInterests = request.input('movieInterests')
    } else {
      movieInterests = JSON.stringify([2, 60, 157, 19, 146]).toString()
    }

    if (haveSerieInterests) {
      serieInterests = request.input('serieInterests')
    } else {
      serieInterests = JSON.stringify([135, 136, 137, 163, 140])
    }

    const profile = await user
      .related('profiles')
      .create({ name, avatar, movieInterests, serieInterests, birthdate })

    console.log('[DEBUG] User', user?.email, 'created a new profile. (', profile.name, ')')

    return response.status(201).json(profile)
  }

  async getProfiles({ auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    const profiles = await Profile.query().where('user_id', user.id)

    console.log(
      '[DEBUG] User',
      user.email,
      'requested their profiles. (' + profiles.length + ' profiles)'
    )

    return response.status(200).json(profiles)
  }

  async deleteProfile({ auth, request, response }: HttpContext) {
    const user = auth.user

    const { id } = request.only(['id'])

    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    const profile = await Profile.query().where('id', id).andWhere('user_id', user.id).first()

    if (!profile) {
      return response.status(404).send('Profile not found')
    }

    console.log('[DEBUG] User', user.email, 'deleted a profile. (', profile.name, ')')

    await profile.delete()
  }

  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.user

    const { id, name, avatar, birthdate, movieInterests, serieInterests } = request.only([
      'id',
      'name',
      'avatar',
      'birthdate',
      'movieInterests',
      'serieInterests',
    ])

    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    const profile = await Profile.query().where('id', id).andWhere('user_id', user.id).first()

    if (!profile) {
      return response.status(404).send('Profile not found')
    }

    profile.name = name
    profile.avatar = avatar
    profile.birthdate = birthdate
    profile.movieInterests = movieInterests
    profile.serieInterests = serieInterests

    await profile.save()

    console.log('[DEBUG] User', user.email, 'updated a profile. (', profile.name, ')')

    return response.status(200).json(profile)
  }

  async eraseProfileHistory({ auth, request, response }: HttpContext) {
    const user = auth.user

    const { id } = request.only(['id'])

    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    const profile = await Profile.query().where('id', id).andWhere('user_id', user.id).first()

    if (!profile) {
      return response.status(404).send('Profile not found')
    }

    await Interaction.query()
      .where('profile_id', profile.id)
      .where('interaction_type', 'view')
      .delete()

    console.log('[DEBUG] User', user.email, 'erased the history of a profile. (', profile.name, ')')

    return response.status(200).json(profile)
  }

  async testRecommandation({ response }: HttpContext) {
    const user1 = await Profile.query().where('id', 1).first()
    const user2 = await Profile.query().where('id', 8).first()

    if (!user1 || !user2) {
      return response.status(404).send('Profiles not found')
    }

    const similarity = await userSimilarity(user1, user2)

    console.log('Similarity between', user1.name, 'and', user2.name, ':', similarity)
  }
}
