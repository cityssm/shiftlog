import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js';
import updateWorkOrderType from '../../database/workOrderTypes/updateWorkOrderType.js';
export default async function handler(request, response) {
    const success = await updateWorkOrderType(request.body, request.session.user?.userName ?? '');
    if (success) {
        const workOrderTypes = await getWorkOrderTypesAdmin();
        response.json({
            success: true,
            workOrderTypes
        });
    }
    else {
        response.json({
            message: 'Work order type could not be updated.',
            success: false
        });
    }
}
