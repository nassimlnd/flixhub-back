import Interaction from '#models/interaction'
import type { HttpContext } from '@adonisjs/core/http'

export default class InteractionsController {
  async registerInteraction({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized()
    }

    const { profileId, mediaId, mediaType, interactionType } = request.only([
      'profileId',
      'mediaId',
      'mediaType',
      'interactionType',
    ])

    // Check if profileId is valid and belongs to the user
    const profile = await user.related('profiles').query().where('id', profileId).first()

    if (!profile) {
      return response.notFound('Profile not found')
    }

    // Register interaction
    const interaction = new Interaction()
    interaction.profileId = profileId
    interaction.mediaId = mediaId
    interaction.mediaType = mediaType
    interaction.interactionType = interactionType

    await interaction.related('profile').associate(profile)
    await interaction.save()

    console.log(
      '[DEBUG] User ',
      user.email,
      'with profile',
      profile.name,
      'registered a ',
      interactionType,
      'interaction with media',
      mediaId,
      'of type',
      mediaType
    )

    return response.status(201).json(interaction)
  }

  async getInteractions({ auth, request, response }: HttpContext) {
    const user = auth.user
    const params = request.params()

    if (!user) {
      return response.unauthorized()
    }

    const profileId = params.id

    // Check if profileId is valid and belongs to the user
    const profile = await user.related('profiles').query().where('id', profileId).first()

    if (!profile) {
      return response.notFound('Profile not found')
    }

    const interactions = await profile.related('interactions').query().preload('profile')

    console.log('[DEBUG] User', user.email, 'with profile', profile.name, 'fetched interactions')

    return response.status(200).json(interactions)
  }

  async getInteractionsByType({ auth, request, response }: HttpContext) {
    const user = auth.user
    const params = request.params()

    if (!user) {
      return response.unauthorized()
    }

    const profileId = params.id
    const interactionType = params.type

    // Check if profileId is valid and belongs to the user
    const profile = await user.related('profiles').query().where('id', profileId).first()

    if (!profile) {
      return response.notFound('Profile not found')
    }

    const interactions = await profile
      .related('interactions')
      .query()
      .where('interactionType', interactionType)
      .preload('profile')

    console.log(
      '[DEBUG] User',
      user.email,
      'with profile',
      profile.name,
      'fetched interactions of type',
      interactionType
    )

    return response.status(200).json(interactions)
  }
}
