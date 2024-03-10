import Movie from '#models/movie'
import MovieCategory from '#models/movie_category'
import SerieCategory from '#models/serie_category'
import env from '#start/env'
import axios from 'axios'

const API_URL = 'http://azertyuk.dynns.com/player_api.php'

const config = {
  headers: {
    'User-Agent': 'okhttp/3.8.0',
    'Accept-Encoding': 'gzip',
    'Host': 'azertyuk.dynns.com',
  },
}

const USERNAME: string = env.get('EXTERNAL_API_USERNAME', '')
const PASSWORD: string = env.get('EXTERNAL_API_PASSWORD', '')

export async function importMovieCategories() {
  let params = new URLSearchParams()
  params.append('username', USERNAME)
  params.append('password', PASSWORD)
  params.append('action', 'get_vod_categories')

  const response = await axios.post(API_URL, params, config)

  if (response.status !== 200) {
    return null
  }

  const categories = await response.data

  console.log('[DB] Importing movie categories')

  let count = 0

  for (const category of categories) {
    await MovieCategory.updateOrCreate(
      {
        id: category.category_id,
        name: category.category_name,
      },
      {
        id: category.category_id,
        name: category.category_name,
      }
    )

    count++
    //console.log('[DB] Imported movie category ' + movieCategory.name)
  }

  console.log('[DB]', count, 'movie categories imported')
}

export async function importMovies() {
  let params = new URLSearchParams()
  params.append('username', USERNAME)
  params.append('password', PASSWORD)
  params.append('action', 'get_vod_streams')

  const response = await axios.post(API_URL, params, config)

  if (response.status !== 200) {
    return null
  }

  const movies = await response.data

  console.log('[DB] Importing movies')

  let count = 0

  for (const movieJson of movies) {
    await Movie.updateOrCreate(
      {
        title: movieJson.name,
        stream_id: movieJson.stream_id,
      },
      {
        title: movieJson.name,
        stream_id: movieJson.stream_id,
        poster: movieJson.stream_icon,
        category_id: movieJson.category_id,
        tmdb_id: movieJson.tmdb,
        url:
          'http://azertyuk.dynns.com/' +
          movieJson.stream_type +
          '/' +
          USERNAME +
          '/' +
          PASSWORD +
          '/' +
          movieJson.stream_id +
          '.' +
          movieJson.container_extension,
      }
    )
    count++

    //console.log('[DB] Imported movie ' + movie.title)
  }

  console.log('[DB]', count, 'movies imported')
}

export async function importSerieCategories() {
  let params = new URLSearchParams()
  params.append('username', USERNAME)
  params.append('password', PASSWORD)
  params.append('action', 'get_series_categories')

  const response = await axios.post(API_URL, params, config)

  if (response.status !== 200) {
    return null
  }

  const categories = await response.data

  console.log('[DB] Importing serie categories')

  let count = 0
  for (const category of categories) {
    await SerieCategory.updateOrCreate(
      {
        id: category.category_id,
        name: category.category_name,
      },
      {
        id: category.category_id,
        name: category.category_name,
      }
    )
    count++
    //console.log('[DB] Imported serie category ' + serieCategory.name)
  }

  console.log('[DB]', count, 'serie categories imported')
}
