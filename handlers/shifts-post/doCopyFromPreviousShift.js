import copyFromPreviousShift from '../../database/shifts/copyFromPreviousShift.js';
export default async function handler(request, response) {
    const success = await copyFromPreviousShift(request.body, request.session.user);
    response.json({
        success
    });
}
