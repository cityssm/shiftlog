import createDataList from '../../database/app/createDataList.js';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import getDataLists from '../../database/app/getDataLists.js';
import recoverDataList from '../../database/app/recoverDataList.js';
export default async function handler(request, response) {
    // Validate that the dataListKey starts with "user-"
    if (!request.body.dataListKey.startsWith('user-')) {
        response.json({
            success: false,
            errorMessage: 'Non-system data list keys must start with "user-" prefix.'
        });
        return;
    }
    const userName = request.session.user?.userName ?? '';
    // First, try to recover a deleted data list with the same key
    const wasRecovered = await recoverDataList({
        dataListKey: request.body.dataListKey,
        dataListName: request.body.dataListName,
        userName
    });
    let success = wasRecovered;
    // If not recovered, create a new data list
    if (!wasRecovered) {
        const form = {
            ...request.body,
            isSystemList: false,
            userName
        };
        success = await createDataList(form, form.userName);
    }
    let dataLists;
    if (success) {
        const lists = await getDataLists();
        // Get items for each data list
        dataLists = await Promise.all(
            lists.map(async (dataList) => ({
                ...dataList,
                items: await getDataListItemsAdmin(dataList.dataListKey)
            }))
        );
    }
    response.json({
        success,
        errorMessage: success ? undefined : 'Failed to create data list.',
        dataLists,
        wasRecovered
    });
}
