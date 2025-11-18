import getEmployees from '../../database/employees/getEmployees.js';
import getTimesheetTypeDataListItems from '../../database/timesheets/getTimesheetTypeDataListItems.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    let supervisors = await getEmployees({ isSupervisor: true });
    if (!(request.session.user?.userProperties.timesheets.canManage ?? false)) {
        supervisors = supervisors.filter((supervisor) => supervisor.userName === request.session.user?.userName);
    }
    const timesheetTypes = await getTimesheetTypeDataListItems(request.session.user);
    response.render('timesheets/edit', {
        headTitle: `Create New ${getConfigProperty('timesheets.sectionNameSingular')}`,
        isCreate: true,
        isEdit: true,
        timesheet: {
            timesheetId: -1,
            timesheetDate: new Date(),
            timesheetTypeDataListItemId: -1,
            supervisorEmployeeNumber: '',
            timesheetTitle: '',
            timesheetNote: ''
        },
        timesheetTypes,
        supervisors
    });
}
