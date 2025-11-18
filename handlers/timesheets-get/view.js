import getTimesheet from '../../database/timesheets/getTimesheet.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('timesheets.router')}`;
export default async function handler(request, response) {
    const timesheet = await getTimesheet(request.params.timesheetId, request.session.user);
    if (timesheet === undefined) {
        response.redirect(`${redirectRoot}/?error=notFound`);
        return;
    }
    response.render('timesheets/edit', {
        headTitle: `${getConfigProperty('timesheets.sectionNameSingular')} #${request.params.timesheetId}`,
        isCreate: false,
        isEdit: false,
        timesheet,
        timesheetTypes: [],
        supervisors: []
    });
}
