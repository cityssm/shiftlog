import getUserFromDatabase from '../database/users/getUser.js';
import { getUserNameFromApiKey } from './cache/apiKeys.cache.js';
export const SYSTEM_USER = {
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
};
export async function apiKeyIsValid(request) {
    const apiKey = request.params?.apiKey;
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
    const localUser = await getUserFromDatabase(userNameLowerCase);
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
        };
    }
    return undefined;
}
