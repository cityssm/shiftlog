import deleteShiftCrew from '../../database/shifts/deleteShiftCrew.js';
export default async function handler(request, response) {
    const success = await deleteShiftCrew(request.body);
    response.json({
        success
    });
}
