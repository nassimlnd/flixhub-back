import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request, auth, response }: HttpContext) {
    console.log('Called register')

    const { email, password, fullName, nickname, phoneNumber } = request.only([
      'email',
      'password',
      'fullName',
      'nickname',
      'phoneNumber',
    ])
    const user = await User.create({ fullName, nickname, phoneNumber, email, password })
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
    response.json({ message: 'Logged out successfully' })
  }
}
