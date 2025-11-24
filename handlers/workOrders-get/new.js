import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js';
import getWorkOrderTypeDataListItems from '../../database/workOrders/getWorkOrderTypeDataListItems.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const workOrderTypes = await getWorkOrderTypeDataListItems(request.session.user);
    const workOrderStatuses = await getWorkOrderStatusDataListItems(request.session.user);
    const workOrder = {
        workOrderOpenDateTime: new Date(),
        workOrderDetails: '',
        requestorName: request.session.user?.firstName + ' ' + request.session.user?.lastName,
        requestorContactInfo: '',
        locationAddress1: '',
        locationAddress2: '',
        locationCityProvince: getConfigProperty('workOrders.defaultLocationCityProvince') ?? ''
    };
    response.render('workOrders/edit', {
        headTitle: `Create New ${getConfigProperty('workOrders.sectionNameSingular')}`,
        isCreate: true,
        isEdit: true,
        workOrder,
        workOrderTypes,
        workOrderStatuses,
        assignedToOptions: []
    });
}
