import addDataListItem from '../../database/app/addDataListItem.js';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
export default async function handler(request, response) {
    const { dataListItems, dataListKey, userGroupId } = request.body;
    const userName = request.session.user?.userName ?? '';
    // Split items by newline and trim/filter empty lines
    const itemsToAdd = dataListItems
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item !== '');
    let addedCount = 0;
    let skippedCount = 0;
    // Add each item
    for (const dataListItem of itemsToAdd) {
        const form = {
            dataListItem,
            dataListKey,
            userGroupId,
            userName
        };
        const success = await addDataListItem(form);
        if (success) {
            addedCount += 1;
        }
        else {
            skippedCount += 1;
        }
    }
    // Get updated items list
    const items = await getDataListItemsAdmin(dataListKey);
    response.json({
        addedCount,
        items,
        skippedCount,
        success: true
    });
}
