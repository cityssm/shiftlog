import addDataListItem from '../../database/app/addDataListItem.js';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
export default async function handler(request, response) {
    const { dataListItems, dataListKey, userGroupId } = request.body;
    const userName = request.session.user?.userName ?? '';
    // Split the items by newline and filter out empty lines
    const itemLines = dataListItems
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    let addedCount = 0;
    let skippedCount = 0;
    // Process each item
    for (const itemLine of itemLines) {
        const form = {
            dataListItem: itemLine,
            dataListKey,
            userGroupId,
            userName
        };
        // eslint-disable-next-line no-await-in-loop -- Need to process items sequentially to maintain order
        const success = await addDataListItem(form);
        if (success) {
            addedCount += 1;
        }
        else {
            skippedCount += 1;
        }
    }
    // Get the updated list of items
    const items = await getDataListItemsAdmin(dataListKey);
    response.json({
        addedCount,
        items,
        skippedCount,
        success: true
    });
}
