/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const MoviesController = () => import('#controllers/movies_controller')
const M3UsController = () => import('#controllers/m_3_us_controller')
const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    welcome:
      'Welcome to the FlixHub API! Made by Nassim LOUNADI. Please check the project on my portfolio: nassimlounadi.fr',
  }
})

// Movies routes

router.get('/movies', [MoviesController, 'getAll']).use(middleware.auth())
router.get('/movies/groups/all', [MoviesController, 'getGroups'])
router
  .get('/movies/groups/:groupTitle', [MoviesController, 'getMoviesByGroup'])
  .use(middleware.auth())
router
  .get('/movies/groups/:groupTitle/:amount', [MoviesController, 'getMoviesByGroupAndAmount'])
  .use(middleware.auth())
router.get('/movies/random', [MoviesController, 'getRandomMovie']).use(middleware.auth())
router
  .get('/movies/random/:amount', [MoviesController, 'getRandomMovieByAmount'])
  .use(middleware.auth())
router.get('/movies/search/:query', [MoviesController, 'searchMovies']).use(middleware.auth())
router.get('/movies/:id', [MoviesController, 'getMovieById']).use(middleware.auth())

// M3Us routes

router.post('/m3u/upload', [M3UsController, 'upload'])

// Auth routes

router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])
router.post('/auth/logout', [AuthController, 'logout'])
