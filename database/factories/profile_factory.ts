import factory from '@adonisjs/lucid/factories'
import Profile from '#models/profile'
import db from '@adonisjs/lucid/services/db'

export const ProfileFactory = factory
  .define(Profile, async ({ faker }) => {
    let interests = await db.from('movies').distinct('group_title').orderByRaw('RAND()').limit(10)
    let interestsArray = []
    for (let interest of interests) {
      interestsArray.push(interest.group_title)
    }
    let interestsString = JSON.stringify(interestsArray)

    let id = await db.from('users').select('id').orderByRaw('RAND()').first()
    let profileCount = await db.from('profiles').count('id as count').where('id', id.id).first()

    return {
      avatar: 'avatar1.png',
      name: faker.person.firstName(),
      birthdate: faker.date.past().toString(),
      interests: interestsString,
      userId: id.id,
    }
  })
  .build()
