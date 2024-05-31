import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import chalk from 'chalk'

interface SeededProject {
  name: string
  slug: string
  description: string
  avatarUrl: string
  ownerId: string
}

const prisma = new PrismaClient()

async function deleteBeforeCreate() {
  console.log(chalk.red('Deleting data...'))
  await prisma.project.deleteMany()
  await prisma.member.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()
}

function createSeededUser(passwordHash: string) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatarUrl: faker.image.avatarGitHub(),
    passwordHash,
  }
}

function createSeededProjects(quantity: number, randomUsersIds: string[]) {
  const seededProjects: SeededProject[] = []

  for (quantity; quantity > 0; quantity--) {
    const project = {
      name: faker.lorem.words(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement(randomUsersIds),
    }

    seededProjects.push(project)
  }

  return seededProjects
}

async function seed() {
  await deleteBeforeCreate()

  console.log(chalk.green('Creating users...'))
  const passwordHash = await hash('123456', 1)

  const testUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@acme.com',
      avatarUrl: 'https://github.com/diego3g.png',
      passwordHash,
    },
  })

  const mockedUser = await prisma.user.create({
    data: createSeededUser(passwordHash),
  })

  const anotherMockedUser = await prisma.user.create({
    data: createSeededUser(passwordHash),
  })

  const usersIds = [testUser.id, mockedUser.id, anotherMockedUser.id]

  console.log(chalk.green('Creating organizations...'))

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Admin)',
      domain: 'acme.com',
      slug: 'acme-admin',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: testUser.id,
      projects: {
        createMany: {
          data: createSeededProjects(3, usersIds),
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: testUser.id,
              role: 'ADMIN',
            },
            {
              userId: mockedUser.id,
              role: 'BILLING',
            },
            {
              userId: anotherMockedUser.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Billing)',
      slug: 'acme-billing',
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: mockedUser.id,
      projects: {
        createMany: {
          data: createSeededProjects(3, usersIds),
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: testUser.id,
              role: 'BILLING',
            },
            {
              userId: mockedUser.id,
              role: 'ADMIN',
            },
            {
              userId: anotherMockedUser.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Member)',
      slug: 'acme-member',
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: anotherMockedUser.id,
      projects: {
        createMany: {
          data: createSeededProjects(3, usersIds),
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: testUser.id,
              role: 'MEMBER',
            },
            {
              userId: mockedUser.id,
              role: 'BILLING',
            },
            {
              userId: anotherMockedUser.id,
              role: 'ADMIN',
            },
          ],
        },
      },
    },
  })
}

seed().then(() => {
  console.log(chalk.green('Database seeded!'))
})
