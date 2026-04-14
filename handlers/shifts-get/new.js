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
    let shiftDate = new Date();
    if (request.query.date !== undefined && request.query.date !== '') {
        try {
            const parsedDate = new Date(request.query.date);
            if (!Number.isNaN(parsedDate.getTime())) {
                shiftDate = parsedDate;
            }
        }
        catch {
        }
    }
    const shift = {
        shiftDate,
        shiftTimeDataListItemId: shiftTimes.length === 1 ? shiftTimes[0].dataListItemId : -1,
        shiftTypeDataListItemId: shiftTypes.length === 1 ? shiftTypes[0].dataListItemId : -1,
        supervisorEmployeeNumber: supervisors.length === 1 ? supervisors[0].employeeNumber : '',
        shiftDescription: ''
    };
    response.render('shifts/edit', {
        headTitle: `Create New ${getConfigProperty('shifts.sectionNameSingular')}`,
        section: 'shifts',
        isCreate: true,
        isEdit: true,
        shift,
        shiftCrews: [],
        shiftEmployees: [],
        shiftEquipment: [],
        shiftAdhocTasks: [],
        shiftWorkOrders: [],
        shiftTimesheets: [],
        shiftTimes,
        shiftTypes,
        supervisors
    });
}
