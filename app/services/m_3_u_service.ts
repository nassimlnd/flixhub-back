import Movie from '#models/movie'
import Serie from '#models/serie'
import TvShow from '#models/tv_show'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { createReadStream } from 'node:fs'

export async function importM3U(file: string) {
  console.log('Start of importM3U function')
  const lines = file.split('\n')

  const movieList: Movie[] = []
  const serieList: Serie[] = []
  const tvShowList: TvShow[] = []

  let currentData: string[] = []

  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const pattern =
        /#EXTINF:-1 tvg-id="([^"]*)" tvg-name="([^"]*)" tvg-logo="([^"]*)" group-title="([^"]*)",([^"]*)/
      const matches = line.match(pattern)

      if (matches) {
        const [, tvgId, tvgName, tvgLogo, groupTitle, title] = matches

        currentData.push(tvgId, tvgName, tvgLogo, groupTitle, title)
      } else {
        console.log('Aucune correspondance trouvée.')
      }
    } else {
      if (line.startsWith('http')) {
        if (line.includes('movie')) {
          const movie = new Movie()
          movie.url = line
          movie.title = currentData[1]
          //movie.group_title = currentData[3]
          movie.title = currentData[4]

          if (currentData[2] === 'https://image.tmdb.org/t/p/w600_and_h900_bestv2') {
            movie.poster = ''
          } else {
            movie.poster = currentData[2]
          }

          let currentMovie = await Movie.query().where('title', movie.title).first()

          if (currentMovie !== null) {
            currentMovie.url = movie.url
            currentMovie.save()
          } else {
            movieList.push(movie)
            movie.save()
          }

          currentData = []
        } else if (line.includes('serie')) {
          const serie = new Serie()

          if (currentData[2] === 'https://image.tmdb.org/t/p/w600_and_h900_bestv2') {
            serie.poster = ''
          } else {
            serie.poster = currentData[2]
          }

          serieList.push(serie)

          currentData = []
        } else {
          const tvShow = new TvShow()
          tvShow.url = line
          tvShow.tvg_id = currentData[0]
          tvShow.tvg_name = currentData[1]
          tvShow.group_title = currentData[3]
          tvShow.title = currentData[4]

          if (currentData[2] === '') {
            tvShow.tvg_logo = ''
          } else {
            tvShow.tvg_logo = currentData[2]
          }

          tvShowList.push(tvShow)
          tvShow.save()

          currentData = []
        }
      }
    }
  }

  console.log('Number of tv shows: ', tvShowList.length)
  console.log('Number of series: ', serieList.length)
  console.log('Number of movies: ', movieList.length)
  console.log('End of importM3U function')
}

export async function parseFile(rawFile: MultipartFile): Promise<string> {
  return new Promise((resolve, reject) => {
    if (rawFile.tmpPath) {
      const file = createReadStream(rawFile.tmpPath)
      let data = ''
      file.on('data', (chunk) => {
        data += chunk.toString()
      })

      file.on('error', (error) => {
        reject(error)
      })

      file.on('end', () => {
        resolve(data)
      })
    }
  })
}
