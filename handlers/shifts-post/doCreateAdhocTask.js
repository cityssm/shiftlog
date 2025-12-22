import addShiftAdhocTask from '../../database/adhocTasks/addShiftAdhocTask.js';
import createAdhocTask from '../../database/adhocTasks/createAdhocTask.js';
import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js';
export default async function handler(request, response) {
    // Create the ad hoc task
    const adhocTaskId = await createAdhocTask(request.body.adhocTaskTypeDataListItemId, request.body.taskDescription, request.body.locationAddress1, request.body.locationAddress2, request.body.locationCityProvince, request.body.locationLatitude, request.body.locationLongitude, request.body.fromLocationAddress1, request.body.fromLocationAddress2, request.body.fromLocationCityProvince, request.body.fromLocationLatitude, request.body.fromLocationLongitude, request.body.toLocationAddress1, request.body.toLocationAddress2, request.body.toLocationCityProvince, request.body.toLocationLatitude, request.body.toLocationLongitude, request.body.taskDueDateTimeString, request.session.user);
    if (adhocTaskId === undefined) {
        response.json({
            success: false,
            errorMessage: 'Failed to create ad hoc task.'
        });
        return;
    }
    // Add the task to the shift
    const success = await addShiftAdhocTask(request.body.shiftId, adhocTaskId, request.body.shiftAdhocTaskNote);
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
            errorMessage: 'Failed to add task to shift.'
        });
    }
}
