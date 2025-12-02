import deleteShift from '../../database/shifts/deleteShift.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('shifts.router')}`;
export default async function handler(request, response) {
    const success = await deleteShift(request.body.shiftId, request.session.user?.userName ?? '');
    if (success) {
        response.json({
            success: true,
            redirectUrl: redirectRoot
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: 'Failed to delete shift.'
        });
    }
}
