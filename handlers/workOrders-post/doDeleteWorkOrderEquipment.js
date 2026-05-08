import deleteWorkOrderEquipment from '../../database/workOrders/deleteWorkOrderEquipment.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderEquipment(request.body);
    response.json({
        success,
        ...(success
            ? {}
            : {
                errorMessage: `Failed to remove equipment from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
            })
    });
}
