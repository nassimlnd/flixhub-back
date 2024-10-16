/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import Movie from '#models/movie'

const ListsController = () => import('#controllers/lists_controller')
const RatingsController = () => import('#controllers/ratings_controller')
const MoviesController = () => import('#controllers/movies_controller')
const M3UsController = () => import('#controllers/m_3_us_controller')
const AuthController = () => import('#controllers/auth_controller')
const NotificationsController = () => import('#controllers/notifications_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const InteractionsController = () => import('#controllers/interactions_controller')
const SeriesController = () => import('#controllers/series_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import Serie from '#models/serie'
import { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'

router.get('/', async () => {
  return {
    welcome:
      'Welcome to the FlixHub API! Made by Nassim LOUNADI. Please check the project on my portfolio: nassimlounadi.fr',
  }
})

// Movies routes

router
  .group(() => {
    router.get('/movies', [MoviesController, 'getAll'])
    router.get('/movies/category/name/:name', [MoviesController, 'getMovieCategoryByName'])
    router.get('/movies/category/:id', [MoviesController, 'getMovieCategoryById'])
    router.get('/movies/category/:categoryId/movies', [MoviesController, 'getMoviesByCategory'])
    router.get('/movies/categories', [MoviesController, 'getCategories'])

    router.get('/movies/category/:categoryId/movies/:amount', [
      MoviesController,
      'getMoviesByCategoryAndAmount',
    ])

    router.get('/movies/random', [MoviesController, 'getRandomMovie'])
    router.get('/movies/random/:amount', [MoviesController, 'getRandomMovieByAmount'])

    router.get('/movies/search/:query', [MoviesController, 'searchMovies'])
    router.get('/movies/update', [MoviesController, 'updateMovies'])

    router.get('/movies/:id', [MoviesController, 'getMovieById'])
  })
  .use(middleware.auth())

// Series routes

router
  .group(() => {
    router.get('/series/update', [SeriesController, 'importSeries'])

    router.get('/series', [SeriesController, 'getAll'])
    router.get('/series/random', [SeriesController, 'getRandomSerie'])
    router.get('/series/:id', [SeriesController, 'getSerieById'])
    router.get('/series/category/:id', [SeriesController, 'getSerieCategoryById'])
    router.get('/series/category/:categoryId/:amount', [
      SeriesController,
      'getSeriesByCategoryAndAmount',
    ])
  })
  .use(middleware.auth())

// Notifications routes

router.get('/notifications', [NotificationsController, 'getAll']).use(middleware.auth())
router.post('/notifications', [NotificationsController, 'sendNotifications'])
router.post('/notifications/all', [NotificationsController, 'sendNotificationToAll'])

// Profile routes

router.get('/profile', [ProfilesController, 'getProfiles']).use(middleware.auth())
router.post('/profile', [ProfilesController, 'createProfile']).use(middleware.auth())
router.post('/profile/delete', [ProfilesController, 'deleteProfile']).use(middleware.auth())
router.post('/profile/update', [ProfilesController, 'updateProfile']).use(middleware.auth())
router
  .post('/profile/history/remove', [ProfilesController, 'eraseProfileHistory'])
  .use(middleware.auth())

// Interaction routes

router
  .post('/profile/:id/interaction', [InteractionsController, 'registerInteraction'])
  .use(middleware.auth())

router
  .get('/profile/:id/interaction', [InteractionsController, 'getInteractions'])
  .use(middleware.auth())

router
  .get('/profile/:id/interaction/:type', [InteractionsController, 'getInteractionsByType'])
  .use(middleware.auth())

router
  .get('/profile/:id/interaction/:type/:mediaType', [
    InteractionsController,
    'getByMediaTypeAndInteractionType',
  ])
  .use(middleware.auth())

// List routes

router.get('/profile/:id/list', [ListsController, 'getListById']).use(middleware.auth())

router.post('/profile/:id/list/delete', [ListsController, 'deleteMovie']).use(middleware.auth())

router.post('/profile/:id/list/add', [ListsController, 'addMovie']).use(middleware.auth())

// Rating routes

router.post('/rating', [RatingsController, 'registerRating']).use(middleware.auth())

// M3Us routes

router.post('/m3u/upload', [M3UsController, 'upload'])

// Auth routes

router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])
router.post('/auth/logout', [AuthController, 'logout'])
router.post('/auth/fcm', [AuthController, 'registerFCMToken']).use(middleware.auth())

// User routes

router.post('/user/update', [AuthController, 'updateUser']).use(middleware.auth())

// Recommandation routes

router.get('/recommandation', [ProfilesController, 'testRecommandation'])

// Search route

router
  .get('/search/:query', async (request) => {
    const query = request.params.query

    let title = decodeURIComponent(query)
    title = title.replaceAll('+', ' ')

    const movies = await Movie.query().where('title', 'LIKE', `%${title}%`).exec()
    const series = await Serie.query().where('title', 'LIKE', `%${title}%`).exec()

    if (!movies && !series) {
      return {
        message: 'No results found',
      }
    }

    return {
      movies,
      series,
    }
  })
  .use(middleware.auth())

// IA Routes for tests
router.get('/ia', async ({ request, response }: HttpContext) => {
  const prompt = request.only(['prompt'])

  if (!prompt) {
    return response.badRequest('Prompt is required')
  }

  console.log('[DEBUG] Prompt:', prompt)

  const res = await axios.post('http://localhost:11434/api/generate', {
    model: 'tinyllama:latest',
    prompt:
      'Write a typescript function who calculates the fibonacci suit recursively without explanation',
    stream: false,
  })

  if (res.status === 200) {
    return res.data.response
  }

  return res
})
