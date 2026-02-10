import addDataListItem from '../../database/app/addDataListItem.js';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
export default async function handler(request, response) {
    const form = {
        ...request.body,
        userName: request.session.user?.userName ?? ''
    };
    const success = await addDataListItem(form);
    let items;
    if (success) {
        items = await getDataListItemsAdmin(form.dataListKey);
    }
    response.json({
        success,
        items
    });
}
