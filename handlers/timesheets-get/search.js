import getEmployees from '../../database/employees/getEmployees.js';
import getTimesheetTypeDataListItems from '../../database/timesheets/getTimesheetTypeDataListItems.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const supervisors = await getEmployees({ isSupervisor: true });
    const timesheetTypes = await getTimesheetTypeDataListItems(request.session.user);
    response.render('timesheets/search', {
        headTitle: `${getConfigProperty('timesheets.sectionNameSingular')} Search`,
        supervisors,
        timesheetTypes
    });
}
