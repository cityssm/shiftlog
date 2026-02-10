import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import reorderDataListItems from '../../database/app/reorderDataListItems.js';
export default async function handler(request, response) {
    const form = {
        ...request.body,
        userName: request.session.user?.userName ?? ''
    };
    const success = await reorderDataListItems(form);
    let items;
    if (success) {
        items = await getDataListItemsAdmin(form.dataListKey);
    }
    response.json({
        success,
        items
    });
}
