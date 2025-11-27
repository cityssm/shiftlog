import deleteWorkOrderType from '../../database/workOrderTypes/deleteWorkOrderType.js';
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderType(request.body.workOrderTypeId, request.session.user?.userName ?? '');
    if (success) {
        const workOrderTypes = await getWorkOrderTypesAdmin();
        response.json({
            success: true,
            workOrderTypes
        });
    }
    else {
        response.json({
            message: 'Work order type could not be deleted.',
            success: false
        });
    }
}
