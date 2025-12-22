import getAdhocTaskTypeDataListItems from '../../database/adhocTasks/getAdhocTaskTypeDataListItems.js';
export default async function handler(request, response) {
    const adhocTaskTypes = await getAdhocTaskTypeDataListItems(request.session.user);
    response.json({
        success: true,
        adhocTaskTypes
    });
}
