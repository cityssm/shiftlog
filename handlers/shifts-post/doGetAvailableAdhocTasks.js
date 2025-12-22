import getAvailableAdhocTasks from '../../database/adhocTasks/getAvailableAdhocTasks.js';
export default async function handler(request, response) {
    const adhocTasks = await getAvailableAdhocTasks(request.body.shiftId);
    response.json({
        success: true,
        adhocTasks
    });
}
