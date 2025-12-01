import getDeletedShifts from '../../database/shifts/getDeletedShifts.js';
export default async function handler(request, response) {
    const { shifts, totalCount } = await getDeletedShifts({
        limit: request.body.limit,
        offset: request.body.offset
    }, request.session.user);
    response.json({
        success: true,
        shifts,
        totalCount
    });
}
