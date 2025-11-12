import getUserFromDatabase from '../database/users/getUser.js';
import { getUserNameFromApiKey } from './cache/apiKeys.cache.js';
export async function apiKeyIsValid(request) {
    const apiKey = request.params?.apiKey;
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (apiKey === undefined) {
        return false;
    }
    const userName = await getUserNameFromApiKey(apiKey);
    if (userName === undefined) {
        return false;
    }
    return true;
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
