import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.create({ email, password })
    await auth.use('web').login(user)
    response.json({ message: 'Registered successfully' })
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.json({ message: 'Logged out successfully' })
  }
}
