import reorderAssignedToItems from '../../database/assignedTo/reorderAssignedToItems.js';
export default async function handler(request, response) {
    const success = await reorderAssignedToItems(request.body.assignedToIds, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
