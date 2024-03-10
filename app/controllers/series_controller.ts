import { importSerieCategories, importSeries } from '#services/external_api_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async importSeries({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    console.log('[DB] User ' + user?.email + ' is updating series')

    importSerieCategories()

    importSeries()

    return response.status(200).json({
      message: 'Series updated',
    })
  }
}
