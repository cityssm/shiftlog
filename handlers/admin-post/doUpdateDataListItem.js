import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import updateDataListItem from '../../database/app/updateDataListItem.js';
export default async function handler(request, response) {
    const form = {
        colorHex: request.body.colorHex,
        dataListItem: request.body.dataListItem,
        dataListItemId: request.body.dataListItemId,
        iconClass: request.body.iconClass,
        userGroupId: request.body.userGroupId,
        userName: request.session.user?.userName ?? ''
    };
    const success = await updateDataListItem(form);
    let items;
    if (success) {
        items = await getDataListItemsAdmin(request.body.dataListKey);
    }
    response.json({
        items,
        success
    });
}
