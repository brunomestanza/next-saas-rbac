import { z } from 'zod'

const userSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('read'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.literal('User'),
])

export type UserSubject = z.infer<typeof userSubject>
