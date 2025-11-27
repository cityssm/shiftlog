import getUserFromDatabase from '../database/users/getUser.js';
import { getUserNameFromApiKey } from './cache/apiKeys.cache.js';
export const SYSTEM_USER = {
    userName: 'system',
    employeeNumber: '',
    firstName: '',
    lastName: '',
    userProperties: {
        isAdmin: true,
        shifts: { canView: true, canUpdate: true, canManage: true },
        workOrders: { canView: true, canUpdate: true, canManage: true },
        timesheets: { canView: true, canUpdate: true, canManage: true }
    },
    userSettings: {}
};
export async function apiKeyIsValid(request) {
    const apiKey = request.params?.apiKey;
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (apiKey === undefined) {
        return false;
    }
    const userName = await getUserNameFromApiKey(apiKey);
    return userName !== undefined;
}
export function userIsAdmin(request) {
    return request.session?.user?.userProperties.isAdmin ?? false;
}
export async function getUser(userName) {
    const userNameLowerCase = userName.toLowerCase();
    // First check local users in database
    const localUser = await getUserFromDatabase(userNameLowerCase);
    if (localUser?.isActive ?? false) {
        return {
            userName: userNameLowerCase,
            employeeNumber: localUser?.employeeNumber ?? '',
            firstName: localUser?.firstName ?? '',
            lastName: localUser?.lastName ?? '',
            userProperties: {
                shifts: {
                    canView: localUser?.shifts_canView ?? false,
                    canUpdate: localUser?.shifts_canUpdate ?? false,
                    canManage: localUser?.shifts_canManage ?? false
                },
                workOrders: {
                    canView: localUser?.workOrders_canView ?? false,
                    canUpdate: localUser?.workOrders_canUpdate ?? false,
                    canManage: localUser?.workOrders_canManage ?? false
                },
                timesheets: {
                    canView: localUser?.timesheets_canView ?? false,
                    canUpdate: localUser?.timesheets_canUpdate ?? false,
                    canManage: localUser?.timesheets_canManage ?? false
                },
                isAdmin: localUser?.isAdmin ?? false
            },
            userSettings: localUser?.userSettings ?? {}
        };
    }
    return undefined;
}
