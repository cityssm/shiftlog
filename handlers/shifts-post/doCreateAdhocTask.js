import addShiftAdhocTask from '../../database/adhocTasks/addShiftAdhocTask.js';
import createAdhocTask from '../../database/adhocTasks/createAdhocTask.js';
import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js';
export default async function handler(request, response) {
    // Create the ad hoc task
    const adhocTaskId = await createAdhocTask({
        adhocTaskTypeDataListItemId: request.body.adhocTaskTypeDataListItemId,
        taskDescription: request.body.taskDescription,
        locationAddress1: request.body.locationAddress1,
        locationAddress2: request.body.locationAddress2,
        locationCityProvince: request.body.locationCityProvince,
        locationLatitude: request.body.locationLatitude,
        locationLongitude: request.body.locationLongitude,
        fromLocationAddress1: request.body.fromLocationAddress1,
        fromLocationAddress2: request.body.fromLocationAddress2,
        fromLocationCityProvince: request.body.fromLocationCityProvince,
        fromLocationLatitude: request.body.fromLocationLatitude,
        fromLocationLongitude: request.body.fromLocationLongitude,
        toLocationAddress1: request.body.toLocationAddress1,
        toLocationAddress2: request.body.toLocationAddress2,
        toLocationCityProvince: request.body.toLocationCityProvince,
        toLocationLatitude: request.body.toLocationLatitude,
        toLocationLongitude: request.body.toLocationLongitude,
        taskDueDateTimeString: request.body.taskDueDateTimeString
    }, request.session.user);
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
