import { defineAbilityFor } from '@saas/auth'

const ability = defineAbilityFor({ role: 'ADMIN', id: 'user-id' })

console.log(ability.can('read', 'Billing'))
console.log(ability.can('create', 'Invite'))
console.log(ability.can('delete', 'Project'))
