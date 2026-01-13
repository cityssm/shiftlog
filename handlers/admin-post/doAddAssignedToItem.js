import createAssignedToItem from '../../database/assignedTo/createAssignedToItem.js';
export default async function handler(request, response) {
    try {
        const assignedToId = await createAssignedToItem(request.body, request.session.user?.userName ?? '');
        response.json({
            success: true,
            assignedToId
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: error.message
        });
    }
}
