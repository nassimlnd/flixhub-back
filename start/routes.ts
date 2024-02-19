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
    hello: 'world',
  }
})

router.get('/movies', [MoviesController, 'getAll']).use(middleware.auth())
router.get('/movies/groups/all', [MoviesController, 'getGroups'])
router
  .get('/movies/groups/:groupTitle', [MoviesController, 'getMoviesByGroup'])
  .use(middleware.auth())

router.post('/m3u/upload', [M3UsController, 'upload'])

router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])
router.post('/auth/logout', [AuthController, 'logout'])
