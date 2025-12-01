import recoverShift from '../../database/shifts/recoverShift.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('shifts.router')}`;
export default async function handler(request, response) {
    const success = await recoverShift(request.body.shiftId, request.session.user?.userName ?? '');
    if (success) {
        response.json({
            success: true,
            message: 'Shift recovered successfully.',
            redirectUrl: `${redirectRoot}/${request.body.shiftId}`
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: 'Failed to recover shift.'
        });
    }
}
