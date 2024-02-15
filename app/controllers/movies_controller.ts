import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  getAll({ response }: HttpContext) {
    return response.json({
      message: 'Get all movies',
    })
  }
}
