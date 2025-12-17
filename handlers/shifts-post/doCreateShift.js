import createShift from '../../database/shifts/createShift.js';
export default async function handler(request, response) {
    const shiftId = await createShift(request.body, request.session.user?.userName ?? '');
    response.json({
        success: true,
        shiftId
    });
}
