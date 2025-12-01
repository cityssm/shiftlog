import getDeletedTimesheets from '../../database/timesheets/getDeletedTimesheets.js';
export default async function handler(request, response) {
    const { timesheets, totalCount } = await getDeletedTimesheets({
        limit: request.body.limit,
        offset: request.body.offset
    }, request.session.user);
    response.json({
        success: true,
        timesheets,
        totalCount
    });
}
