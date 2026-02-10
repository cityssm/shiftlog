import addWorkOrderType from '../../database/workOrderTypes/addWorkOrderType.js';
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const workOrderTypeId = await addWorkOrderType(request.body, request.session.user?.userName ?? '');
    if (workOrderTypeId > 0) {
        const workOrderTypes = await getWorkOrderTypesAdmin();
        response.json({
            success: true,
            workOrderTypes
        });
    }
    else {
        response.json({
            message: `${getConfigProperty('workOrders.sectionNameSingular')} Type could not be added.`,
            success: false
        });
    }
}
