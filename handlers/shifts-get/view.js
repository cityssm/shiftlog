import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js';
import getShift from '../../database/shifts/getShift.js';
import getShiftCrews from '../../database/shifts/getShiftCrews.js';
import getShiftEmployees from '../../database/shifts/getShiftEmployees.js';
import getShiftEquipment from '../../database/shifts/getShiftEquipment.js';
import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js';
import getTimesheetsByShift from '../../database/timesheets/getTimesheetsByShift.js';
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
    const shiftWorkOrders = (request.session.user?.userProperties.workOrders.canView ?? false)
        ? await getShiftWorkOrders(request.params.shiftId)
        : [];
    const shiftAdhocTasks = await getShiftAdhocTasks(request.params.shiftId);
    const shiftTimesheets = (request.session.user?.userProperties.timesheets.canView ?? false)
        ? await getTimesheetsByShift(request.params.shiftId, request.session.user)
        : [];
    response.render('shifts/edit', {
        headTitle: `${getConfigProperty('shifts.sectionNameSingular')} #${request.params.shiftId}`,
        section: 'shifts',
        isCreate: false,
        isEdit: false,
        shift,
        shiftCrews,
        shiftEmployees,
        shiftEquipment,
        shiftAdhocTasks,
        shiftWorkOrders,
        shiftTimesheets,
        shiftTimes: [],
        shiftTypes: [],
        supervisors: []
    });
}
