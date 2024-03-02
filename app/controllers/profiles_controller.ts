import type { HttpContext } from '@adonisjs/core/http'
import Profile from '#models/profile'
import Interaction from '#models/interaction'
import { userSimilarity } from '#services/recommandation_service'

export default class ProfilesController {
  async createProfile({ auth, request, response }: HttpContext) {
    const user = auth.user
    let interests: string

    const { name, avatar, birthdate, haveInterests } = request.only([
      'name',
      'avatar',
      'birthdate',
      'haveInterests',
    ])

    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    if (haveInterests) {
      interests = request.input('interests')
    } else {
      interests = JSON.stringify([
        'FILMS RÉCEMMENT AJOUTÉS',
        'DOCUMENTAIRES | EMISSION TV',
        'FRANÇAIS',
        'ANIMATION | FAMILIALE | ENFANTS',
        'FANTASTIQUE | AVENTURE',
      ]).toString()
    }

    const profile = await user.related('profiles').create({ name, avatar, interests, birthdate })

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

    const { id, name, avatar, birthdate, interests } = request.only([
      'id',
      'name',
      'avatar',
      'birthdate',
      'interests',
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
    profile.interests = interests

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
