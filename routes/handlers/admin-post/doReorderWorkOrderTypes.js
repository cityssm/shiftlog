import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js';
import reorderWorkOrderTypes from '../../database/workOrderTypes/reorderWorkOrderTypes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const success = await reorderWorkOrderTypes(request.body.workOrderTypeIds, request.session.user?.userName ?? '');
    if (success) {
        const workOrderTypes = await getWorkOrderTypesAdmin();
        response.json({
            success: true,
            workOrderTypes
        });
    }
    else {
        response.json({
            message: `${getConfigProperty('workOrders.sectionNameSingular')} Types could not be reordered.`,
            success: false
        });
    }
}
