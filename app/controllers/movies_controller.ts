import Movie from '#models/movie'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class MoviesController {
  async getAll({ response }: HttpContext) {
    console.log('Getting all movies')
    let movies = await Movie.all()
    console.log('Mvoies: ', movies)
    return response.json({
      movies: movies,
    })
  }

  async getGroups({ response }: HttpContext) {
    console.log('Getting all groups')
    let groups = await db.from('movies').distinct('group_title')
    console.log('Groups: ', groups)
    return response.json({
      groups: groups,
    })
  }
}
