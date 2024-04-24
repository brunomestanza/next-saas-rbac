import { ability } from '@saas/auth'

const userCanInviteSomeoneElse = ability.can('invite', 'User')
console.log(userCanInviteSomeoneElse)

const userCanDeleteOtherUsers = ability.can('delete', 'User')
console.log(userCanDeleteOtherUsers)
