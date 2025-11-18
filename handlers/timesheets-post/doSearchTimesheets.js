import getTimesheets from '../../database/timesheets/getTimesheets.js';
export default async function handler(request, response) {
    const filters = {
        timesheetDateString: request.body.timesheetDateString,
        supervisorEmployeeNumber: request.body.supervisorEmployeeNumber,
        timesheetTypeDataListItemId: request.body.timesheetTypeDataListItemId
    };
    const options = {
        limit: request.body.limit ?? 50,
        offset: request.body.offset ?? 0
    };
    const result = await getTimesheets(filters, options, request.session.user);
    response.json(result);
}
