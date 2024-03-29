import Movie from '#models/movie'
import MovieCategory from '#models/movie_category'
import { importMovieCategories, importMovies } from '#services/external_api_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  // Categories methods

  async getCategories({ auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    console.log('[DEBUG] Getting movie categories')
    let categories = await MovieCategory.all()
    return response.json(categories)
  }

  async getMovieCategoryById({ request, auth, response }: HttpContext) {
    const user = auth.user
    const params = request.params()
    const id = Number.parseInt(params.id)

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    console.log('[DEBUG] Getting movie category #', id)
    let category = await MovieCategory.find(id)

    return response.json(category)
  }

  async getMoviesByCategory({ request, response, auth }: HttpContext) {
    const params = request.params()

    let categoryId = Number.parseInt(params.categoryId)

    const user = auth.user

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    const movieCategory = await MovieCategory.find(categoryId)

    if (!movieCategory) {
      return response.status(404).json({
        message: 'Category not found',
      })
    }

    console.log(
      '[DEBUG] User ' + user?.email + ' is getting all movies by category ' + movieCategory.name
    )

    let movies = await Movie.query().where('category_id', movieCategory.id)

    return response.json(movies)
  }

  async getMoviesByCategoryAndAmount({ request, response, auth }: HttpContext) {
    const params = request.params()

    let categoryId = decodeURIComponent(params.categoryId)
    const amount = Number.parseInt(params.amount)

    const user = auth.user
    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    const movieCategory = await MovieCategory.find(categoryId)

    if (!movieCategory) {
      return response.status(404).json({
        message: 'Category not found',
      })
    }

    console.log(
      '[DEBUG] User ' +
        user?.email +
        ' is getting ' +
        amount +
        ' movies by category ' +
        movieCategory.name
    )

    let movies = await Movie.query().where('category_id', movieCategory.id).limit(amount)
    return response.json(movies)
  }

  async getMovieCategoryByName({ request, response, auth }: HttpContext) {
    const user = auth.user
    const params = request.params()

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    const categoryName = decodeURIComponent(params.name)

    const movieCategory = await MovieCategory.findBy('name', categoryName)

    if (!movieCategory) {
      return response.status(404).json({
        message: 'Category not found',
      })
    }

    console.log('[DEBUG] User ' + user?.email + ' is getting category ' + movieCategory.name)

    return response.json(movieCategory)
  }
  // End of categories methods

  // Random methods

  async getRandomMovieByAmount({ request, response, auth }: HttpContext) {
    const params = request.params()
    const amount = Number.parseInt(params.amount)
    const user = auth.user

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    console.log('[DEBUG] User ' + user?.email + ' is getting ' + amount + ' random movies')
    let movies = await Movie.query().orderByRaw('RAND()').limit(amount)
    return response.json(movies)
  }

  async getRandomMovie({ response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    console.log('[DEBUG] User ' + user?.email + ' is getting a random movie')

    let movie = await Movie.query().orderByRaw('RAND()').limit(1)
    return response.json(movie)
  }

  // End of random methods

  // Movies methods

  async searchMovies({ request, response, auth }: HttpContext) {
    const params = request.params()
    let query = decodeURIComponent(params.query)
    query = query.replaceAll('+', ' ')

    const user = auth.user
    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    console.log('[DEBUG] User ' + user?.email + ' is searching for movies with query ' + query)

    let movies = await Movie.query()
      .where('title', 'like', '%' + query + '%')
      .limit(25)

    return response.json(movies)
  }

  async getMovieById({ request, response, auth }: HttpContext) {
    const params = request.params()
    const id = Number.parseInt(params.id)
    const user = auth.user

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    console.log('[DEBUG] User ' + user?.email + ' is getting movie with id ' + id)
    let movie = await Movie.find(id)
    return response.json(movie)
  }

  async getAll({ response, auth }: HttpContext) {
    const user = auth.user
    console.log('[DEBUG] User ' + user?.email + ' is getting all movies')
    let movies = await Movie.all()

    return response.json(movies)
  }

  // End of movies methods

  // Import methods

  async updateMovies({ auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.status(401).json({
        message: 'Unauthorized',
      })
    }

    console.log('[DB] User ' + user?.email + ' is updating movies')

    importMovieCategories()

    importMovies()

    return response.json({
      message: 'Movies updated',
    })
  }

  // End of import methods
}
