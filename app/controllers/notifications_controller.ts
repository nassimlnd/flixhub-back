import Notification from '#models/notification'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotificationsController {
  async getAll({ auth }: HttpContext) {
    const user = await auth.authenticate()
    return user.notifications
  }

  async sendNotifications({ request, response }: HttpContext) {
    const params = request.only(['title', 'message', 'userId'])
    const notification = await Notification.create(params)

    return response.status(201).json(notification)
  }
}
