import addWorkOrderEquipment from '../../database/workOrders/addWorkOrderEquipment.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const userName = request.session.user?.userName;
    if (userName === undefined || userName === '') {
        response.json({
            success: false,
            errorMessage: `Failed to add equipment to ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        });
        return;
    }
    const success = await addWorkOrderEquipment(request.body, userName);
    response.json({
        success,
        ...(success
            ? {}
            : {
                errorMessage: `Failed to add equipment to ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
            })
    });
}
