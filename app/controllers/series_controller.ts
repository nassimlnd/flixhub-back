import Episode from '#models/episode'
import Serie from '#models/serie'
import SerieCategory from '#models/serie_category'
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

  async getSeriesByCategoryAndAmount({ auth, response, request }: HttpContext) {
    const params = request.params()
    const user = auth.user

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    const categoryId = params.categoryId
    const amount = params.amount

    const serieCategory = await SerieCategory.find(categoryId)

    if (!serieCategory) {
      return response.status(404).json({
        message: 'Category not found',
      })
    }

    let series

    if (amount > 1) {
      series = await Serie.query().where('category_id', serieCategory.id).limit(amount)
    } else {
      series = await Serie.query().where('category_id', serieCategory.id)
    }

    console.log(
      '[DEBUG] User ' +
        user?.email +
        ' is getting ' +
        amount +
        ' series from category ' +
        serieCategory.name
    )

    return response.json(series)
  }

  async getSerieCategoryById({ auth, response, request }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    const params = request.params()
    const id = params.id

    const serieCategory = await SerieCategory.find(id)

    if (!serieCategory) {
      return response.status(404).json({
        message: 'Category not found',
      })
    }

    console.log('[DEBUG] User ' + user?.email + ' is getting serie category with id ' + id)

    return response.json(serieCategory)
  }

  async getRandomSerie({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    const serie = await Serie.query().orderByRaw('RAND()').limit(1).first()

    if (!serie) {
      return response.status(404).json({
        message: 'No series found',
      })
    }

    console.log('[DEBUG] User ' + user?.email + ' is getting random serie')

    return response.json(serie)
  }
}
