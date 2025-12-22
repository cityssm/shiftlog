import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js';
import updateAdhocTask from '../../database/adhocTasks/updateAdhocTask.js';
export default async function handler(request, response) {
    const success = await updateAdhocTask(request.body.adhocTaskId, request.body.adhocTaskTypeDataListItemId, request.body.taskDescription, request.body.locationAddress1, request.body.locationAddress2, request.body.locationCityProvince, request.body.locationLatitude, request.body.locationLongitude, request.body.fromLocationAddress1, request.body.fromLocationAddress2, request.body.fromLocationCityProvince, request.body.fromLocationLatitude, request.body.fromLocationLongitude, request.body.toLocationAddress1, request.body.toLocationAddress2, request.body.toLocationCityProvince, request.body.toLocationLatitude, request.body.toLocationLongitude, request.body.taskDueDateTimeString, request.body.taskCompleteDateTimeString, request.session.user);
    if (success) {
        const shiftAdhocTasks = await getShiftAdhocTasks(request.body.shiftId);
        response.json({
            success: true,
            shiftAdhocTasks
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: 'Failed to update ad hoc task.'
        });
    }
}
