import getPreviousShifts from '../../database/shifts/getPreviousShifts.js';
export default async function handler(request, response) {
    const shifts = await getPreviousShifts(request.body, request.session.user);
    response.json({
        success: true,
        shifts
    });
}
