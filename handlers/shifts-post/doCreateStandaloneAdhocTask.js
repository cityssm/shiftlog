import createAdhocTask from '../../database/adhocTasks/createAdhocTask.js';
import getAvailableAdhocTasks from '../../database/adhocTasks/getAvailableAdhocTasks.js';
export default async function handler(request, response) {
    // Create the ad hoc task without assigning to a shift
    const adhocTaskId = await createAdhocTask(request.body.adhocTaskTypeDataListItemId, request.body.taskDescription, request.body.locationAddress1, request.body.locationAddress2, request.body.locationCityProvince, request.body.locationLatitude, request.body.locationLongitude, request.body.fromLocationAddress1, request.body.fromLocationAddress2, request.body.fromLocationCityProvince, request.body.fromLocationLatitude, request.body.fromLocationLongitude, request.body.toLocationAddress1, request.body.toLocationAddress2, request.body.toLocationCityProvince, request.body.toLocationLatitude, request.body.toLocationLongitude, request.body.taskDueDateTimeString, request.session.user);
    if (adhocTaskId === undefined) {
        response.json({
            success: false,
            errorMessage: 'Failed to create ad hoc task.'
        });
        return;
    }
    // Get all available adhoc tasks to return
    const adhocTasks = await getAvailableAdhocTasks();
    response.json({
        success: true,
        adhocTaskId,
        adhocTasks
    });
}
