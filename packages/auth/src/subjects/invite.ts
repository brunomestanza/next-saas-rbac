import { z } from 'zod'

const inviteSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('read'),
    z.literal('delete'),
  ]),
  z.literal('Invite'),
])

export type InviteSubject = z.infer<typeof inviteSubject>
