import updateWorkOrderEquipmentNote from '../../database/workOrders/updateWorkOrderEquipmentNote.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const userName = request.session.user?.userName;
    if (userName === undefined || userName === '') {
        response.json({
            success: false,
            errorMessage: `Failed to update equipment note for ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        });
        return;
    }
    const success = await updateWorkOrderEquipmentNote(request.body, userName);
    response.json({
        success,
        ...(success
            ? {}
            : {
                errorMessage: `Failed to update equipment note for ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
            })
    });
}
