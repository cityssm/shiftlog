import getUserFromDatabase from '../database/users/getUser.js'

import { getUserNameFromApiKey } from './cache/apiKeys.cache.js'

export interface APIRequest {
  params?: {
    apiKey?: string
  }
}

export interface UserRequest {
  session?: {
    user?: User
  }
}

export const SYSTEM_USER: User = {
  userName: 'system',

  employeeNumber: '',
  firstName: '',
  lastName: '',
  userProperties: {
    isAdmin: true,
    shifts: { canManage: true, canUpdate: true, canView: true },
    timesheets: { canManage: true, canUpdate: true, canView: true },
    workOrders: { canManage: true, canUpdate: true, canView: true }
  },
  userSettings: {}
}

export async function apiKeyIsValid(request: APIRequest): Promise<boolean> {
  const apiKey = request.params?.apiKey

  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (apiKey === undefined) {
    return false
  }

  const userName = await getUserNameFromApiKey(apiKey)

  return userName !== undefined
}

export function userIsAdmin(request: UserRequest): boolean {
  return request.session?.user?.userProperties.isAdmin ?? false
}

export async function getUser(userName: string): Promise<User | undefined> {
  const userNameLowerCase = userName.toLowerCase()

  // First check local users in database
  const localUser = await getUserFromDatabase(userNameLowerCase)

  if (localUser?.isActive ?? false) {
    return {
      userName: userNameLowerCase,

      employeeNumber: localUser?.employeeNumber ?? '',
      firstName: localUser?.firstName ?? '',
      lastName: localUser?.lastName ?? '',

      userProperties: {
        shifts: {
          canManage: localUser?.shifts_canManage ?? false,
          canUpdate: localUser?.shifts_canUpdate ?? false,
          canView: localUser?.shifts_canView ?? false
        },

        workOrders: {
          canManage: localUser?.workOrders_canManage ?? false,
          canUpdate: localUser?.workOrders_canUpdate ?? false,
          canView: localUser?.workOrders_canView ?? false
        },

        timesheets: {
          canManage: localUser?.timesheets_canManage ?? false,
          canUpdate: localUser?.timesheets_canUpdate ?? false,
          canView: localUser?.timesheets_canView ?? false
        },

        isAdmin: localUser?.isAdmin ?? false
      },
      userSettings: localUser?.userSettings ?? {}
    } satisfies User
  }

  return undefined
}
