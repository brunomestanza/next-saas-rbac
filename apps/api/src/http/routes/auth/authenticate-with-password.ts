import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { BadRequestError } from '@/http/errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with e-mail and password',
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          400: z.object({
            message: z.string(),
          }),
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const userWithEmail = await prisma.user.findUnique({ where: { email } })

      if (!userWithEmail) {
        throw new BadRequestError('Invalid credentials.')
      }

      if (userWithEmail.passwordHash === null) {
        throw new BadRequestError(
          'User does not have a password, use social login.',
        )
      }

      const isPasswordValid = await compare(
        password,
        userWithEmail.passwordHash,
      )

      if (!isPasswordValid) {
        throw new BadRequestError('Invalid credentials.')
      }

      const token = await reply.jwtSign(
        { sub: userWithEmail.id },
        { sign: { expiresIn: '7d' } },
      )

      return reply.status(201).send({ token })
    },
  )
}
