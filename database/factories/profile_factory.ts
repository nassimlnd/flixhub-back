import factory from '@adonisjs/lucid/factories'
import Profile from '#models/profile'
import db from '@adonisjs/lucid/services/db'

export const ProfileFactory = factory
  .define(Profile, async ({ faker }) => {
    return {
      avatar: 'avatar1.png',
      name: faker.person.firstName(),
      birthdate: faker.date.past().toString(),
      interests: JSON.stringify(
        await db.from('movies').distinct('group_title').orderByRaw('RAND()').limit(10)
      ),
      userId: 1,
    }
  })
  .build()
