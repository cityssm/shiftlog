import deleteAdhocTask from '../../database/adhocTasks/deleteAdhocTask.js';
import deleteShiftAdhocTask from '../../database/adhocTasks/deleteShiftAdhocTask.js';
import getAdhocTaskShiftCount from '../../database/adhocTasks/getAdhocTaskShiftCount.js';
import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js';
export default async function handler(request, response) {
    // Remove task from shift
    const removeSuccess = await deleteShiftAdhocTask(request.body.shiftId, request.body.adhocTaskId);
    if (!removeSuccess) {
        response.json({
            success: false,
            errorMessage: 'Failed to remove task from shift.'
        });
        return;
    }
    // If deleteTask is true, try to delete the task entirely
    if (request.body.deleteTask) {
        // Check if task is still on other shifts
        const shiftCount = await getAdhocTaskShiftCount(request.body.adhocTaskId);
        if (shiftCount > 0) {
            response.json({
                success: false,
                errorMessage: 'Cannot delete task as it is still assigned to other shifts.'
            });
            return;
        }
        // Delete the task
        const deleteSuccess = await deleteAdhocTask(request.body.adhocTaskId, request.session.user);
        if (!deleteSuccess) {
            response.json({
                success: false,
                errorMessage: 'Failed to delete task.'
            });
            return;
        }
    }
    const shiftAdhocTasks = await getShiftAdhocTasks(request.body.shiftId);
    response.json({
        success: true,
        shiftAdhocTasks
    });
}
