import deleteAssignedToItem from '../../database/assignedTo/deleteAssignedToItem.js';
export default async function handler(request, response) {
    const success = await deleteAssignedToItem(request.body.assignedToId, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
