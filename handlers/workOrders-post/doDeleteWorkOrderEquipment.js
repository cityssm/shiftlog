import deleteWorkOrderEquipment from '../../database/workOrders/deleteWorkOrderEquipment.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const userName = request.session.user?.userName;
    if (userName === undefined || userName === '') {
        response.json({
            success: false,
            errorMessage: `Failed to remove equipment from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        });
        return;
    }
    const success = await deleteWorkOrderEquipment(request.body, userName);
    response.json({
        success,
        ...(success
            ? {}
            : {
                errorMessage: `Failed to remove equipment from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
            })
    });
}
