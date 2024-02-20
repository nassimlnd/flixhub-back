import Movie from '#models/movie'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class MoviesController {
  async getAll({ response, auth }: HttpContext) {
    const user = auth.user
    console.log('[DEBUG] User ' + user?.email + ' is getting all movies')
    let movies = await Movie.all()
    return response.json({
      movies: movies,
    })
  }

  async getMoviesByGroup({ request, response, auth }: HttpContext) {
    const params = request.params()
    let groupTitle = decodeURIComponent(params.groupTitle)
    groupTitle = groupTitle.replaceAll('+', ' ')
    const user = auth.user
    console.log('[DEBUG] User ' + user?.email + ' is getting all movies by group ' + groupTitle)
    let movies = await Movie.query().where('group_title', groupTitle)
    return response.json({
      movies: movies,
    })
  }

  async getMoviesByGroupAndAmount({ request, response, auth }: HttpContext) {
    const params = request.params()
    let groupTitle = decodeURIComponent(params.groupTitle)
    groupTitle = groupTitle.replaceAll('+', ' ')
    const amount = Number.parseInt(params.amount)
    const user = auth.user
    console.log(
      '[DEBUG] User ' + user?.email + ' is getting ' + amount + ' movies by group ' + groupTitle
    )
    let movies = await Movie.query().where('group_title', groupTitle).limit(amount)
    return response.json({
      movies: movies,
    })
  }

  async getRandomMovie({ response, auth }: HttpContext) {
    const user = auth.user
    console.log('[DEBUG] User ' + user?.email + ' is getting a random movie')
    let movie = await Movie.query().orderByRaw('RAND()').limit(1)
    return response.json({
      movie: movie,
    })
  }

  async getGroups({ response }: HttpContext) {
    console.log('[DEBUG] Getting all groups')
    let groups = await db.from('movies').distinct('group_title')
    return response.json({
      groups: groups,
    })
  }
}
