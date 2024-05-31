import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability'

import { User } from './models/user'
import { permissions } from './permissions'
import { BillingSubject } from './subjects/billing'
import { InviteSubject } from './subjects/invite'
import { OrganizationSubject } from './subjects/organization'
import { ProjectSubject } from './subjects/project'
import { UserSubject } from './subjects/user'

export * from './models/organization'
export * from './models/user'
export * from './models/project'
export * from './roles'

// Both manage and all are intern casl options
// manage means that the user has all the permissions in an subject
// all means all subjects, used for give admin or owner permissions

type AppAbilities =
  | UserSubject
  | ProjectSubject
  | OrganizationSubject
  | InviteSubject
  | BillingSubject
  | ['manage', 'all']

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  // by default the user can't do anything, we have to give permissions
  const builder = new AbilityBuilder(createAppAbility)

  // check if we recieve an user with an wrong role option
  if (typeof permissions[user.role] !== 'function') {
    throw new Error(`Permissions for role ${user.role} not found`)
  }

  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })

  ability.can = ability.can.bind(ability)
  ability.cannot = ability.can.bind(ability)

  return ability
}
