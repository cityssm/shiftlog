import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js';
export default async function handler(request, response) {
    const shiftAdhocTasks = await getShiftAdhocTasks(request.body.shiftId);
    response.json({
        success: true,
        shiftAdhocTasks
    });
}
