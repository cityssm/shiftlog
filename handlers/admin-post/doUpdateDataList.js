import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import getDataLists from '../../database/app/getDataLists.js';
import updateDataList from '../../database/app/updateDataList.js';
export default async function handler(request, response) {
    const form = {
        ...request.body,
        userName: request.session.user?.userName ?? ''
    };
    const success = await updateDataList(form);
    let dataLists;
    if (success) {
        const lists = await getDataLists();
        dataLists = await Promise.all(lists.map(async (dataList) => ({
            ...dataList,
            items: await getDataListItemsAdmin(dataList.dataListKey)
        })));
    }
    response.json({
        success,
        errorMessage: success ? undefined : 'Failed to update data list.',
        dataLists
    });
}
