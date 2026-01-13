import updateAssignedToItem from '../../database/assignedTo/updateAssignedToItem.js';
export default async function handler(request, response) {
    const success = await updateAssignedToItem(request.body, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
