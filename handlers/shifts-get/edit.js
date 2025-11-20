import getEmployees from '../../database/employees/getEmployees.js';
import getShift from '../../database/shifts/getShift.js';
import getShiftCrews from '../../database/shifts/getShiftCrews.js';
import getShiftEmployees from '../../database/shifts/getShiftEmployees.js';
import getShiftEquipment from '../../database/shifts/getShiftEquipment.js';
import getShiftTimeDataListItems from '../../database/shifts/getShiftTimeDataListItems.js';
import getShiftTypeDataListItems from '../../database/shifts/getShiftTypeDataListItems.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('shifts.router')}`;
export default async function handler(request, response) {
    const shift = await getShift(request.params.shiftId, request.session.user);
    if (shift === undefined) {
        response.redirect(`${redirectRoot}/?error=notFound`);
        return;
    }
    else if (!(request.session.user?.userProperties.shifts.canManage ?? false) &&
        shift.supervisorUserName !== request.session.user?.userName) {
        response.redirect(`${redirectRoot}/${shift.shiftId}/?error=forbidden`);
        return;
    }
    else if (shift.recordLock_dateTime !== null &&
        shift.recordLock_dateTime !== undefined &&
        Date.now() >= shift.recordLock_dateTime.getTime()) {
        response.redirect(`${redirectRoot}/${shift.shiftId}/?error=locked`);
        return;
    }
    const shiftCrews = await getShiftCrews(request.params.shiftId);
    const shiftEmployees = await getShiftEmployees(request.params.shiftId);
    const shiftEquipment = await getShiftEquipment(request.params.shiftId);
    let supervisors = await getEmployees({ isSupervisor: true });
    if (!(request.session.user?.userProperties.shifts.canManage ?? false)) {
        supervisors = supervisors.filter((supervisor) => supervisor.userName === request.session.user?.userName);
    }
    const shiftTypes = await getShiftTypeDataListItems(request.session.user);
    const shiftTimes = await getShiftTimeDataListItems(request.session.user);
    response.render('shifts/edit', {
        headTitle: `${getConfigProperty('shifts.sectionNameSingular')} #${request.params.shiftId}`,
        isCreate: false,
        isEdit: true,
        shift,
        shiftCrews,
        shiftEmployees,
        shiftEquipment,
        shiftTimes,
        shiftTypes,
        supervisors
    });
}
