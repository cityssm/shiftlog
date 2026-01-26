import getTimesheets from '../../database/timesheets/getTimesheets.js';
export default async function handler(request, response) {
    const result = await getTimesheets(request.body, request.body, request.session.user);
    response.json({
        success: true,
        timesheets: result.timesheets,
        totalCount: result.totalCount,
        limit: typeof request.body.limit === 'number'
            ? request.body.limit
            : Number.parseInt(request.body.limit, 10),
        offset: typeof request.body.offset === 'number'
            ? request.body.offset
            : Number.parseInt(request.body.offset, 10)
    });
}
