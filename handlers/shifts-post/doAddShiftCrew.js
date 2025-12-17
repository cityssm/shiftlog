import addShiftCrew from '../../database/shifts/addShiftCrew.js';
export default async function handler(request, response) {
    const success = await addShiftCrew(request.body, request.session.user);
    response.json({
        success
    });
}
