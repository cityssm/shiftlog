import deleteDataListItem from '../../database/app/deleteDataListItem.js';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
export default async function handler(request, response) {
    const form = {
        dataListItemId: request.body.dataListItemId,
        userName: request.session.user?.userName ?? ''
    };
    const success = await deleteDataListItem(form);
    let items;
    if (success) {
        items = await getDataListItemsAdmin(request.body.dataListKey);
    }
    response.json({
        success,
        items
    });
}
