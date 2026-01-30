import getShift from '../../database/shifts/getShift.js';
import getShiftCrews from '../../database/shifts/getShiftCrews.js';
import getShiftEmployees from '../../database/shifts/getShiftEmployees.js';
import getShiftEquipment from '../../database/shifts/getShiftEquipment.js';
import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js';
import getWorkOrderMilestones from '../../database/workOrders/getWorkOrderMilestones.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('shifts.router')}`;
export default async function handler(request, response) {
    const shift = await getShift(request.params.shiftId, request.session.user);
    if (shift === undefined) {
        response.redirect(`${redirectRoot}/?error=notFound`);
        return;
    }
    const shiftCrews = await getShiftCrews(request.params.shiftId);
    const shiftEmployees = await getShiftEmployees(request.params.shiftId);
    const shiftEquipment = await getShiftEquipment(request.params.shiftId);
    const shiftWorkOrders = await getShiftWorkOrders(request.params.shiftId);
    // Load milestones for all work orders
    const allMilestones = [];
    for (const workOrder of shiftWorkOrders) {
        // eslint-disable-next-line no-await-in-loop
        const milestones = await getWorkOrderMilestones(workOrder.workOrderId.toString());
        allMilestones.push(...milestones);
    }
    response.render('print/shift', {
        headTitle: `${getConfigProperty('shifts.sectionNameSingular')} #${shift.shiftId}`,
        section: 'shifts',
        shift,
        shiftCrews,
        shiftEmployees,
        shiftEquipment,
        shiftWorkOrders,
        allMilestones
    });
}
