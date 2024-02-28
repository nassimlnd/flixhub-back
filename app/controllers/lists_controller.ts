import type { HttpContext } from '@adonisjs/core/http'
import List from '#models/list'

export default class ListsController {
  async getListById({ request, response, auth }: HttpContext) {
    const params = request.params()
    const user = auth.user
    if (!user) {
      return response.unauthorized()
    }
    const id = Number.parseInt(params.id)

    const profile = await user.related('profiles').query().where('id', id).first()
    if (!profile) {
      return response.notFound('Profile not found')
    }
    let list = await List.find(id)
    return response.json({
      list: list,
    })
  }
}
