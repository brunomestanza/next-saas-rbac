import { z } from 'zod'

import { organizationSchema } from '../models/organization'

// we don't have the create in here, because we only validate permissions after the user is in an organization
// any user can create an organization
const organizationSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('update'),
    z.literal('delete'),
    z.literal('transfer_ownership'),
  ]),
  z.union([z.literal('Organization'), organizationSchema]),
])

export type OrganizationSubject = z.infer<typeof organizationSubject>
