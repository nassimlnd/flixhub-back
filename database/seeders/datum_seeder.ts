import { InteractionFactory } from '#database/factories/interaction_factory'
import { RatingFactory } from '#database/factories/rating_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method

    //let profiles = await ProfileFactory.createMany(1000)
    let interactions = await InteractionFactory.createMany(100000)
    let ratings = await RatingFactory.createMany(100000)

    //console.log('Profiles created:', profiles.length)
    console.log('Interactions created:', interactions.length)
    console.log('Ratings created:', ratings.length)
  }
}
