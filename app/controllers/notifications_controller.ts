import Notification from '#models/notification'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { getMessaging } from 'firebase-admin/messaging'
import FCM from '#models/fcm'

export default class NotificationsController {
  async getAll({ auth, response }: HttpContext) {
    const user = auth.user
    console.log('[DEBUG] User', user?.email, 'is getting his notifications')
    if (!user) {
      return null
    }

    const notifications = await Notification.query().where('userId', user.id).exec()

    return response.json(notifications)
  }

  async sendNotifications({ request, response }: HttpContext) {
    const params = request.only(['title', 'message', 'userId'])
    const user = await User.findOrFail(params.userId)

    console.log(
      '[DEBUG] Sending notification to',
      user.email,
      'with title:',
      params.title,
      'and message:',
      params.message
    )

    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    const notification = new Notification()
    notification.title = params.title
    notification.message = params.message

    await notification.related('user').associate(user)

    return response.status(201).json(notification)
  }

  async sendNotificationToAll({ request, response }: HttpContext) {
    const params = request.only(['title', 'message'])
    const users = await User.query().exec()

    console.log(
      '[DEBUG] Sending notification to all users with title:',
      params.title,
      'and message:',
      params.message
    )

    const notifications = []

    for (const user of users) {
      const notification = new Notification()
      notification.title = params.title
      notification.message = params.message

      await notification.related('user').associate(user)
      notifications.push(notification)
    }

    return response.status(201).json(notifications)
  }

  async sendNotificationTest({ response }: HttpContext) {
    const url = env.get('GOOGLE_APPLICATION_CREDENTIALS')

    if (!url) {
      return response.status(500).json({ message: 'Google credentials not found' })
    }

    const app = FCM.getInstance()

    if (!app) {
      return response.status(500).json({ message: 'Firebase app not found' })
    }

    const message = {
      data: {
        title: 'Bonsoir paris',
      },
      token:
        'eWg5DgvBQ7assinkjM2FcH:APA91bGDh77J-XOWOcbOAZ30VTk4DTrU3s_aBpCXZH8IDV4GoxuKZ_mCL9a7ASelsexOzJA4gBBJdERfke4xkQO0f2pcHbeAiIe5JMNjR7uGUAFIZ_gjvnJ_0-Hx2HXFTsiKAEZC5Jnw',
    }
    await getMessaging(app)
      .send(message)
      .then((res) => {
        console.log('Successfully sent message:', res)
      })
  }
}
