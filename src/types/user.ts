export enum UserRole {
  PASSENGER = 'passenger',
  DRIVER = 'driver'
}

export type UserRoleType = UserRole.PASSENGER | UserRole.DRIVER

export const USER_ROLES = [UserRole.PASSENGER, UserRole.DRIVER] as const

export interface User {
  firstName: string
  lastName: string
  email: string
  role: UserRoleType
  weeklyUpdates: boolean
}
