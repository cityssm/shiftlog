import getEmployees from '../../database/employees/getEmployees.js';
import getShift from '../../database/shifts/getShift.js';
import getTimesheetTypeDataListItems from '../../database/timesheets/getTimesheetTypeDataListItems.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    let supervisors = await getEmployees({ isSupervisor: true });
    if (!(request.session.user?.userProperties.timesheets.canManage ?? false)) {
        supervisors = supervisors.filter((supervisor) => supervisor.userName === request.session.user?.userName);
    }
    const timesheetTypes = await getTimesheetTypeDataListItems(request.session.user);
    // Get shift data if shiftId is provided
    let shift;
    let timesheetDate = new Date();
    let supervisorEmployeeNumber = '';
    if (request.query.shiftId !== undefined && request.query.shiftId !== '') {
        shift = await getShift(request.query.shiftId, request.session.user);
        if (shift !== undefined) {
            timesheetDate = shift.shiftDate;
            supervisorEmployeeNumber = shift.supervisorEmployeeNumber;
        }
    }
    response.render('timesheets/edit', {
        headTitle: `Create New ${getConfigProperty('timesheets.sectionNameSingular')}`,
        section: 'timesheets',
        isCreate: true,
        isEdit: true,
        timesheet: {
            timesheetId: -1,
            timesheetDate,
            timesheetTypeDataListItemId: timesheetTypes.length === 1 ? timesheetTypes[0].dataListItemId : -1,
            supervisorEmployeeNumber,
            timesheetTitle: '',
            timesheetNote: '',
            shiftId: shift?.shiftId
        },
        supervisors,
        timesheetTypes
    });
}
