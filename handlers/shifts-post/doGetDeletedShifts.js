import getDeletedShifts from '../../database/shifts/getDeletedShifts.js';
export default async function handler(request, response) {
    const shifts = await getDeletedShifts(request.session.user);
    response.json({
        success: true,
        shifts
    });
}
