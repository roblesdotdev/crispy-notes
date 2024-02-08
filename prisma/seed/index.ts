import { db } from '~/lib/db.server'
import { createPassword, createUser, img } from './utils'
import { faker } from '@faker-js/faker'

async function seed() {
  console.log('🌱 Seeding...')
  console.time(`🌱 Database has been seeded`)

  console.time('🧹 Cleaned up the database...')
  await db.user.deleteMany()
  console.timeEnd('🧹 Cleaned up the database...')

  const totalUsers = 5
  console.time(`Created ${totalUsers} users...`)
  for (let index = 0; index < totalUsers; index++) {
    const userData = createUser()
    await db.user.create({
      select: { id: true },
      data: {
        ...userData,
        password: { create: createPassword(userData.username) },
        notes: {
          create: Array.from({
            length: faker.number.int({ min: 1, max: 5 }),
          }).map(() => ({
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs(),
          })),
        },
      },
    })
  }
  console.timeEnd(`Created ${totalUsers} users...`)

  console.time('Create auth user')
  await db.user.create({
    select: { id: true },
    data: {
      email: 'worm@user.com',
      username: 'worm',
      name: 'Worm',
      password: { create: createPassword('wormpassword') },
      notes: {
        create: [
          {
            id: 'd27a197e',
            title: "First Worm's Note",
            content: 'This is the first note created for the user worm.',
            images: {
              create: await img({
                altText: 'an illustration of a hot air balloon',
                filepath: './tests/fixtures/images/notes/1.png',
              }),
            },
          },
        ],
      },
    },
  })
  console.timeEnd('Create auth user')

  console.timeEnd(`🌱 Database has been seeded`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
