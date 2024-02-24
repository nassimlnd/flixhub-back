import Notification from '#models/notification'
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
    console.log('Params: ', params)
    const notification = await Notification.create(params)

    return response.status(201).json(notification)
  }
}
