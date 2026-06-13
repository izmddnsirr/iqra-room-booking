export type Role = 'user' | 'receptionist' | 'admin'

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  receptionist: '/receptionist',
  user: '/dashboard',
}
