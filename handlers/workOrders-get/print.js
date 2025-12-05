import generateBarcodeSvg from '@cityssm/jsbarcode-svg';
import getWorkOrder from '../../database/workOrders/getWorkOrder.js';
import getWorkOrderMilestones from '../../database/workOrders/getWorkOrderMilestones.js';
import getWorkOrderNotes from '../../database/workOrders/getWorkOrderNotes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { availableWorkOrderMoreInfoForms } from '../../helpers/workOrderMoreInfoForms.helpers.js';
const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`;
export default async function handler(request, response) {
    const workOrder = await getWorkOrder(request.params.workOrderId, request.session.user?.userName);
    if (workOrder === undefined) {
        response.redirect(`${redirectRoot}/?error=notFound`);
        return;
    }
    const workOrderNumberBarcodeSvg = generateBarcodeSvg(workOrder.workOrderNumber, {
        format: 'CODE128',
        height: 30,
        width: 2,
        displayValue: false,
        margin: 0
    });
    const milestones = await getWorkOrderMilestones(request.params.workOrderId);
    const notes = await getWorkOrderNotes(request.params.workOrderId);
    response.render('print/workOrder', {
        headTitle: `${getConfigProperty('workOrders.sectionNameSingular')} #${workOrder.workOrderNumber}`,
        milestones,
        notes,
        workOrder,
        workOrderNumberBarcodeSvg,
        availableWorkOrderMoreInfoForms
    });
}
