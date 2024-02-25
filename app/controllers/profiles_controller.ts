import type { HttpContext } from '@adonisjs/core/http'
import Profile from '#models/profile'

export default class ProfilesController {
  async createProfile({ auth, request, response }: HttpContext) {
    const user = auth.user
    const { name, avatarId } = request.only(['name', 'avatarId'])

    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    const profile = await user.related('profiles').create({ name, avatarId })

    return response.status(201).json(profile)
  }

  async getProfiles({ auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    const profiles = await Profile.query().where('user_id', user.id)

    return response.status(200).json(profiles)
  }
}
