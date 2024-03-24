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

const rejectedCategories = ['164', '190', '225', '230']

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
    if (movieJson.tmdb !== '') {
      await Movie.updateOrCreate(
        {
          title: movieJson.name,
          stream_id: movieJson.stream_id,
        },
        {
          id: movieJson.stream_id,
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
    }

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

  for (const rejectedCategory of rejectedCategories) {
    await SerieCategory.query().where('id', rejectedCategory).delete()
    count--
  }

  console.log('[DB]', count, 'serie categories imported')
}

export async function importSeries() {
  let params = new URLSearchParams()
  params.append('username', USERNAME)
  params.append('password', PASSWORD)
  params.append('action', 'get_series')

  const startTime = Date.now()

  const response = await axios.post(API_URL, params, config)

  if (response.status !== 200) {
    return null
  }

  const series = await response.data

  let count = 0
  let episodeCount = 0

  for (const serieJson of series) {
    if (!rejectedCategories.includes(serieJson.category_id)) {
      await Serie.updateOrCreate(
        {
          title: serieJson.name,
          serie_id: serieJson.series_id,
        },
        {
          id: serieJson.series_id,
          title: serieJson.name,
          serie_id: serieJson.series_id,
          poster: serieJson.cover,
          category_id: serieJson.category_id,
          tmdb_id: serieJson.tmdb,
        }
      )

      const serieData = await getSerieInfo(serieJson.series_id)

      if (serieData) {
        for (const seasonNumber in serieData.episodes) {
          let episodes = serieData.episodes[seasonNumber]

          for (const episode of episodes) {
            let posterUrl = 'https://api.nassimlounadi.fr/images/image_placeholder.png'

            if (serieJson.tmdb !== '0') {
              const tmdbApiKey = env.get('TMDB_API_KEY', '')

              const url =
                'https://api.themoviedb.org/3/tv/' +
                serieJson.tmdb +
                '/season/' +
                seasonNumber +
                '/episode/' +
                episode.episode_num +
                '?api_key=' +
                tmdbApiKey +
                '&language=fr-Fr'

              const tmdbRes = await axios.get(url).catch(() => {
                console.log('[DB] Error getting episode info for serie', serieJson.series_id)
                console.log('[DB] URL:', url)
              })

              if (tmdbRes) {
                if (tmdbRes.status !== 200) {
                  posterUrl = 'https://api.nassimlounadi.fr/images/image_placeholder.png'
                } else {
                  const episodeData = await tmdbRes.data

                  if (episodeData.still_path === null) {
                    posterUrl = 'https://api.nassimlounadi.fr/images/image_placeholder.png'
                  } else {
                    posterUrl = 'https://image.tmdb.org/t/p/w500' + episodeData.still_path
                  }
                }
              }
            } else {
              posterUrl = 'https://api.nassimlounadi.fr/images/image_placeholder.png'
            }

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
                poster: posterUrl,
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
            episodeCount++
          }
        }
      }

      count++
    }
  }

  const endTime = Date.now()

  console.log('[DB]', count, 'series imported')
  console.log('[DB]', episodeCount, 'episodes imported')
  console.log('[DB] Import took', endTime - startTime, 'ms')
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

      return await response.data
    } catch (error) {
      console.log('[DB] Error getting serie info', serie_id, 'retrying...')
    }
  }
}
