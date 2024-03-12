import type { HttpContext } from '@adonisjs/core/http'
import List from '#models/list'
import Profile from '#models/profile'
import Movie from '#models/movie'

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

  async deleteMovie({ auth, request, response }: HttpContext) {
    const user = auth.user

    const { id, movieId } = request.only(['id', 'movieId'])

    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    const profile = await Profile.query().where('id', id).andWhere('user_id', user.id).first()

    if (!profile) {
      return response.status(404).send('Profile not found')
    }

    const movie = await List.query()
      .where('movie_id', movieId)
      .andWhere('profile_id', profile.id)
      .first()

    if (!movie) {
      return response.status(404).send('Movie was not found in profile list')
    }
    await movie.delete()
  }

  async addMovie({ auth, request, response }: HttpContext) {
    const user = auth.user
    const params = request.params()
    const id = params.id
    const { movieId } = request.only(['movieId'])
    if (!user) {
      return response.status(401).send('Unauthorized')
    }

    const profile = await Profile.query().where('id', id).andWhere('user_id', user.id).first()

    if (!profile) {
      return response.status(404).send('Profile not found')
    }
    const movie = await Movie.query().where('id', movieId)
    if (!movie) {
      return response.status(404).send('Movie not found')
    }
    const list = new List()
    list.movie_id = movieId
    list.profile_id = profile.id

    await list.save()
  }
}
