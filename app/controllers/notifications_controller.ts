import Notification from '#models/notification'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotificationsController {
  async getAll({ auth, response }: HttpContext) {
    const user = auth.user
    console.log('[DEBUG] User ', user?.email, ' is getting his notifications')
    if (!user) {
      return null
    }

    const notifications = await Notification.query().where('userId', user.id).exec()

    return response.json(notifications)
  }

  async sendNotifications({ request, response }: HttpContext) {
    const params = request.only(['title', 'message', 'userId'])
    const user = await User.findOrFail(params.userId)

    console.log('Params: ', params)

    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    const notification = new Notification()
    notification.title = params.title
    notification.message = params.message

    await notification.related('user').associate(user)

    return response.status(201).json(notification)
  }
}
