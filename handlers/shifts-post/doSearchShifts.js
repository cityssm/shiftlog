import getShifts from '../../database/shifts/getShifts.js';
export default async function handler(request, response) {
    const shiftsResults = await getShifts(request.body, request.body, request.session.user);
    response.json({
        success: true,
        shifts: shiftsResults.shifts,
        totalCount: shiftsResults.totalCount,
        limit: typeof request.body.limit === 'number'
            ? request.body.limit
            : Number.parseInt(request.body.limit, 10),
        offset: typeof request.body.offset === 'number'
            ? request.body.offset
            : Number.parseInt(request.body.offset, 10)
    });
}
