import type { HttpContext } from '@adonisjs/core/http'
import Profile from '#models/profile'

export default class ProfilesController {
  async createProfile({ auth, request, response }: HttpContext) {
    const user = auth.user
    let interests: string

    const { name, avatar, haveInterests } = request.only(['name', 'avatar', 'haveInterests'])

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

    const profile = await user.related('profiles').create({ name, avatar, interests })

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
}
