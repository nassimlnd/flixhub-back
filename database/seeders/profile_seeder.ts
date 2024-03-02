import { ProfileFactory } from '#database/factories/profile_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    const profiles = await ProfileFactory.createMany(100)

    console.log('[Database] Seeded ' + profiles.length + ' profiles.')
  }
}
