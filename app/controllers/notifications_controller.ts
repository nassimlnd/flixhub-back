import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotificationsController {
  async getAll({ auth, response }: HttpContext) {
    const user = auth.user
    console.log('[DEBUG] User ', user?.email, ' is getting his notifications')
    if (!user) {
      return null
    }

    return response.json(user.notifications)
  }

  async sendNotifications({ request, response }: HttpContext) {
    const params = request.only(['title', 'message', 'userId'])
    const user = await User.find(params.userId)

    console.log('Params: ', params)

    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    const notification = await user.related('notifications').create({
      title: params.title,
      message: params.message,
    })

    return response.status(201).json(notification)
  }
}
