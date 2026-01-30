import getWorkOrder from '../../database/workOrders/getWorkOrder.js';
import getWorkOrderThumbnailAttachment from '../../database/workOrders/getWorkOrderThumbnailAttachment.js';
import getWorkOrderType from '../../database/workOrderTypes/getWorkOrderType.js';
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
export default async function handler(request, response) {
    const workOrder = await getWorkOrder(request.params.workOrderId, request.session.user?.userName);
    if (workOrder === undefined) {
        response.redirect(`${redirectRoot}/?error=notFound`);
        return;
    }
    const workOrderType = (await getWorkOrderType(workOrder.workOrderTypeId, request.session.user, true));
    // Get thumbnail attachment
    const thumbnailAttachment = await getWorkOrderThumbnailAttachment(request.params.workOrderId);
    // Check if work order can be reopened
    let canReopen = false;
    if (workOrder.workOrderCloseDateTime !== null &&
        workOrder.workOrderCloseDateTime !== undefined &&
        (request.session.user?.userProperties.workOrders.canUpdate ?? false)) {
        const reopenWindowDays = Number.parseInt(await getCachedSettingValue('workOrders.reopenWindowDays'), 10);
        if (reopenWindowDays > 0) {
            const closeDateTime = new Date(workOrder.workOrderCloseDateTime);
            const now = new Date();
            const daysSinceClosed = (now.getTime() - closeDateTime.getTime()) / MILLISECONDS_PER_DAY;
            canReopen = daysSinceClosed <= reopenWindowDays;
        }
    }
    response.render('workOrders/edit', {
        headTitle: `${getConfigProperty('workOrders.sectionNameSingular')} #${workOrder.workOrderNumber}`,
        section: 'workOrders',
        isCreate: false,
        isEdit: false,
        canReopen,
        workOrder,
        thumbnailAttachment,
        assignedToOptions: [],
        workOrderStatuses: [],
        workOrderPriorities: [],
        workOrderTypes: [workOrderType]
    });
}
