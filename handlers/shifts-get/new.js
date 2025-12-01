import getEmployees from '../../database/employees/getEmployees.js';
import getShiftTimeDataListItems from '../../database/shifts/getShiftTimeDataListItems.js';
import getShiftTypeDataListItems from '../../database/shifts/getShiftTypeDataListItems.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    let supervisors = await getEmployees({ isSupervisor: true });
    if (!(request.session.user?.userProperties.shifts.canManage ?? false)) {
        supervisors = supervisors.filter((supervisor) => supervisor.userName === request.session.user?.userName);
    }
    const shiftTypes = await getShiftTypeDataListItems(request.session.user);
    const shiftTimes = await getShiftTimeDataListItems(request.session.user);
    const shift = {
        shiftDate: new Date(),
        shiftTimeDataListItemId: shiftTimes.length === 1 ? shiftTimes[0].dataListItemId : -1,
        shiftTypeDataListItemId: shiftTypes.length === 1 ? shiftTypes[0].dataListItemId : -1,
        supervisorEmployeeNumber: '',
        shiftDescription: ''
    };
    response.render('shifts/edit', {
        headTitle: `Create New ${getConfigProperty('shifts.sectionNameSingular')}`,
        isCreate: true,
        isEdit: true,
        shift,
        shiftCrews: [],
        shiftEmployees: [],
        shiftEquipment: [],
        shiftTimes,
        shiftTypes,
        supervisors
    });
}
