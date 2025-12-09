import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js';
import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js';
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js';
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const workOrderTypes = await getWorkOrderTypes(request.session.user);
    const workOrderStatuses = await getWorkOrderStatusDataListItems(request.session.user);
    const assignedToOptions = await getAssignedToDataListItems(request.session.user);
    const workOrder = {
        workOrderTypeId: workOrderTypes.length === 1 ? workOrderTypes[0].workOrderTypeId : undefined,
        workOrderDetails: '',
        workOrderOpenDateTime: new Date(),
        requestorContactInfo: '',
        requestorName: `${request.session.user?.firstName} ${request.session.user?.lastName}`.trim(),
        locationAddress1: '',
        locationAddress2: '',
        locationCityProvince: await getCachedSettingValue('locations.defaultCityProvince'),
    };
    response.render('workOrders/edit', {
        headTitle: `Create New ${getConfigProperty('workOrders.sectionNameSingular')}`,
        isCreate: true,
        isEdit: true,
        workOrder,
        assignedToOptions,
        workOrderStatuses,
        workOrderTypes,
    });
}
