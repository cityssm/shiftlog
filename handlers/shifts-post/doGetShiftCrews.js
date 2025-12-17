import getShiftCrews from '../../database/shifts/getShiftCrews.js';
export default async function handler(request, response) {
    const shiftCrews = await getShiftCrews(request.body.shiftId, request.session.user);
    response.json({
        success: true,
        shiftCrews
    });
}
