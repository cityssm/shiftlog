import deleteDataList from '../../database/app/deleteDataList.js';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import getDataLists from '../../database/app/getDataLists.js';
export default async function handler(request, response) {
    const form = {
        ...request.body,
        userName: request.session.user?.userName ?? ''
    };
    const success = await deleteDataList(form);
    let dataLists;
    if (success) {
        const lists = await getDataLists();
        // Get items for each data list
        dataLists = await Promise.all(lists.map(async (dataList) => ({
            ...dataList,
            items: await getDataListItemsAdmin(dataList.dataListKey)
        })));
    }
    response.json({
        success,
        errorMessage: success ? undefined : 'Failed to delete data list.',
        dataLists
    });
}
