import Episode from '#models/episode'
import Movie from '#models/movie'
import MovieCategory from '#models/movie_category'
import Serie from '#models/serie'
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

export async function importSeries() {
  let params = new URLSearchParams()
  params.append('username', USERNAME)
  params.append('password', PASSWORD)
  params.append('action', 'get_series')

  const response = await axios.post(API_URL, params, config)

  if (response.status !== 200) {
    return null
  }

  const series = await response.data

  let count = 0

  for (const serieJson of series) {
    await Serie.updateOrCreate(
      {
        title: serieJson.name,
        serie_id: serieJson.series_id,
      },
      {
        title: serieJson.name,
        serie_id: serieJson.series_id,
        poster: serieJson.cover,
        category_id: serieJson.category_id,
        tmdb_id: serieJson.tmdb,
      }
    )

    const serieData = await getSerieInfo(serieJson.series_id)

    if (serieData) {
      // for (const season of serieData.seasons) {
      //   await Season.updateOrCreate(
      //     {
      //       serie_id: serieJson.series_id,
      //       season_number: serieData.seasons.indexOf(season) + 1,
      //     },
      //     {
      //       serie_id: serieJson.series_id,
      //       season_number: season.season,
      //       poster: season.cover_tmdb,
      //     }
      //   )
      // }

      for (const seasonNumber in serieData.episodes) {
        let episodes = serieData.episodes[seasonNumber]

        for (const episode of episodes) {
          // const season = await Season.query()
          //   .where('serie_id', serieJson.series_id)
          //   .where('season_number', seasonNumber)
          //   .first()

          // if (season === null) {
          //   continue
          // }

          await Episode.updateOrCreate(
            {
              //season_id: season.id,
              season_number: Number.parseInt(seasonNumber),
              episode_num: episodes.indexOf(episode) + 1,
              serie_id: serieJson.series_id,
            },
            {
              title: episode.title,
              //season_id: season.id,
              season_number: Number.parseInt(seasonNumber),
              serie_id: serieJson.series_id,
              episode_num: episodes.indexOf(episode) + 1,
              url:
                'http://azertyuk.dynns.com/series/' +
                USERNAME +
                '/' +
                PASSWORD +
                '/' +
                episode.id +
                '.' +
                episode.container_extension,
            }
          )
        }
      }
    }

    count++
  }

  console.log('[DB]', count, 'series imported')
}

export async function getSerieInfo(serie_id: number) {
  let params = new URLSearchParams()
  params.append('username', USERNAME)
  params.append('password', PASSWORD)
  params.append('action', 'get_series_info')
  params.append('series_id', serie_id.toString())

  let done = false

  while (!done) {
    try {
      const response = await axios.post(API_URL, params, config)

      if (response.status === 200) {
        done = true
      }

      const series = await response.data

      return series
    } catch (error) {
      console.log('Error getting serie info', serie_id, 'retrying...')
    }
  }
}
