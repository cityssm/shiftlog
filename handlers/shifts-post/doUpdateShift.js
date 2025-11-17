import updateShift from '../../database/shifts/updateShift.js';
export default async function handler(request, response) {
    const success = await updateShift(request.body, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
