import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users/password-recover',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Get authenticated user profile',
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (!userWithSameEmail) {
        // We don't want to inform if user really exists
        return reply.status(201).send()
      }

      const { id: code } = await prisma.token.create({
        data: {
          type: 'PASSWORD_RECOVER',
          userId: userWithSameEmail.id,
        },
      })

      // Send e-mail with password recover link

      console.log('Recover password token: ', code)
      return reply.status(201).send()
    },
  )
}
