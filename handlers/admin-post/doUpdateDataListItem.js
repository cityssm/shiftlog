import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import updateDataListItem from '../../database/app/updateDataListItem.js';
export default async function handler(request, response) {
    const form = {
        dataListItemId: request.body.dataListItemId,
        dataListItem: request.body.dataListItem,
        colorHex: request.body.colorHex,
        iconClass: request.body.iconClass,
        userName: request.session.user?.userName ?? '',
        userGroupId: request.body.userGroupId
    };
    const success = await updateDataListItem(form);
    let items;
    if (success) {
        items = await getDataListItemsAdmin(request.body.dataListKey);
    }
    response.json({
        success,
        items
    });
}
