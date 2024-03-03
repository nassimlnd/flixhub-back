import { ProfileFactory } from '#database/factories/profile_factory'
import { RatingFactory } from '#database/factories/rating_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method

    let profiles = await ProfileFactory.createMany(1000)
    let ratings = await RatingFactory.createMany(10000)

    console.log('Profiles created:', profiles.length)
    console.log('Ratings created:', ratings.length)
  }
}
