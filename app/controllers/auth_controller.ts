import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request, auth, response }: HttpContext) {
    console.log('Called register')

    const { email, password, fullName } = request.only(['email', 'password', 'fullName'])

    const user = await User.create({ fullName, email, password })
    await auth.use('web').login(user)
    console.log('User ' + email + ' registered successfully.')

    // Send access token to the client
    return response.json({ message: 'User registered successfully', user })
  }

  async login({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)

    if (!user) {
      return response.status(401).json({ message: 'Invalid credentials' })
    } else {
      await auth.use('web').login(user)
      console.log('[DEBUG] User ' + user.email + ' is logging in')
      return response.json({ message: 'Logged in successfully', user })
    }
  }

  async logout({ auth, response }: HttpContext) {
    console.log('[DEBUG] User ' + auth.user?.email + ' is logging out')
    await auth.use('web').logout()
    return response.json({ message: 'Logged out successfully' })
  }

  async registerFCMToken({ request, auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    const { fcmToken } = request.only(['fcmToken'])

    user.fcmToken = fcmToken

    console.log('[DEBUG] User (' + user.email + ') FCM token registered successfully')

    await user.save()

    return response.json({ message: 'FCM token registered successfully' })
  }

  async updateUser({ request, response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    const { fullName, email } = request.only(['fullName', 'email'])

    user.fullName = fullName
    user.email = email

    await user.save()

    console.log('[DEBUG] User (' + user.email + ') updated successfully')

    return response.json({ message: 'User updated successfully', user })
  }
}
