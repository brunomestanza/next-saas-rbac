import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'
import { Role } from './roles'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN: (user, { can, cannot }) => {
    can('manage', 'all')

    // in casl, we can't deny with conditions after we give all permisions to an user
    // we have to remove an specific permission, and add it again
    cannot(['transfer_ownership', 'update'], 'Organization')
    can(['transfer_ownership', 'update'], 'Organization', {
      ownerId: { $eq: user.id },
    })
  },
  MEMBER: (user, { can }) => {
    can(['read'], 'User')
    can(['create', 'read'], 'Project')
    can(['update', 'delete'], 'Project', { ownerId: user.id })
  },
  BILLING: (_, { can }) => {
    can(['manage'], 'Billing')
  },
}
