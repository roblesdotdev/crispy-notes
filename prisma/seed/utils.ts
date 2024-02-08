import fs from 'node:fs'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { UniqueEnforcer } from 'enforce-unique'

const uniqueUsernameEnforcer = new UniqueEnforcer()

export function createUser() {
  const firstname = faker.person.firstName()
  const lastname = faker.person.lastName()

  const username = uniqueUsernameEnforcer
    .enforce(() => {
      return (
        faker.string.alphanumeric({ length: 2 }) +
        '_' +
        faker.internet.userName({
          firstName: firstname.toLowerCase(),
          lastName: lastname.toLowerCase(),
        })
      )
    })
    .slice(0, 20)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')

  return {
    username,
    name: `${firstname} ${lastname}`,
    email: `${username}@example.com`,
  }
}

export function createPassword(password: string = faker.internet.password()) {
  return {
    hash: bcrypt.hashSync(password, 10),
  }
}

export async function img({
  altText,
  filepath,
}: {
  altText?: string
  filepath: string
}) {
  return {
    altText,
    contentType: filepath.endsWith('.png') ? 'image/png' : 'image/jpeg',
    blob: await fs.promises.readFile(filepath),
  }
}
