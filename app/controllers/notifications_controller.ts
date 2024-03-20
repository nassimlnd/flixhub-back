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
    const tokens = []

    for (const user of users) {
      const notification = new Notification()
      notification.title = params.title
      notification.message = params.message

      await notification.related('user').associate(user)
      notifications.push(notification)

      if (user.fcmToken) {
        tokens.push(user.fcmToken)
      }
    }

    const app = FCM.getInstance()

    if (!app) {
      return response.status(500).json({ message: 'Firebase app not found' })
    }

    const message = {
      data: {
        title: params.title,
        message: params.message,
      },
      tokens,
    }

    await getMessaging(app)
      .sendEachForMulticast(message)
      .then((res) => {
        console.log('Successfully sent message:', res)
      })

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
      tokens: [
        'cAPNjhfIRYyVPDIsgUyblW:APA91bHV6K1jrl45BMlh6lB0sG8ntZcoJirrkeABgdN2AqRU3ylxjanl1TWk07rr1_FHORiglLooyl2DV1p2N6VPRuy1uVnOY64C8NCFUechJbse0CY1e43esy51IB72-Cg9vJuWaAv7',
        'fHukJ4muSeebimtuyEHrE5:APA91bF1KazwbZ0neE03EkgweHV5IeF571onryqFbwfYNJYd9--WQOM_1GH4urrH-jt-AyOA7VofD0C8scoIzxMenxwbx1VMfOaB8WYXquxpprsIUN13X_reX329hZTjls4mO-U9yoye',
      ],
    }
    await getMessaging(app)
      .sendEachForMulticast(message)
      .then((res) => {
        console.log('Successfully sent message:', res)
      })
  }
}
