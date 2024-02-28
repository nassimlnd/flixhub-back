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
}
