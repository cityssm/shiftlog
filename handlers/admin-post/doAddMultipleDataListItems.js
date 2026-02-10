import addDataListItem from '../../database/app/addDataListItem.js';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
export default async function handler(request, response) {
    const { dataListKey, dataListItems, userGroupId } = request.body;
    const userName = request.session.user?.userName ?? '';
    const itemsToAdd = dataListItems
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item !== '');
    let addedCount = 0;
    let skippedCount = 0;
    for (const dataListItem of itemsToAdd) {
        const form = {
            dataListKey,
            dataListItem,
            userGroupId,
            userName
        };
        const success = await addDataListItem(form);
        if (success) {
            addedCount++;
        }
        else {
            skippedCount++;
        }
    }
    const items = await getDataListItemsAdmin(dataListKey);
    response.json({
        success: true,
        items,
        addedCount,
        skippedCount
    });
}
