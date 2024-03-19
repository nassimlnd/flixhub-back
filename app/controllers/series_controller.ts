import Episode from '#models/episode'
import Serie from '#models/serie'
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

  async getAll({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    console.log('[DEBUG] User ' + user?.email + ' is getting all series')

    const series = await Serie.query().orderBy('id', 'asc')

    return response.json(series)
  }

  async getSerieById({ auth, response, request }: HttpContext) {
    const params = request.params()
    const user = auth.user

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    const id = params.id

    console.log('[DEBUG] User ' + user?.email + ' is getting serie with id ' + id)

    const serie = await Serie.find(id)

    if (!serie) {
      return response.status(404).json({
        message: 'Serie not found',
      })
    }

    const episodes = await Episode.query()
      .where('serie_id', serie.serie_id)
      .orderBy('season_number', 'asc')
      .orderBy('episode_num', 'asc')

    return response.json({ serie, episodes })
  }
}
