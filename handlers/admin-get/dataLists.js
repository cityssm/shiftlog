import getDataLists from '../../database/app/getDataLists.js';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(_request, response) {
    const dataLists = await getDataLists();
    const userGroups = await getUserGroups();
    // Get items for each data list
    const dataListsWithItems = await Promise.all(dataLists.map(async (dataList) => ({
        ...dataList,
        items: await getDataListItemsAdmin(dataList.dataListKey)
    })));
    response.render('admin/dataLists', {
        headTitle: 'Data List Management',
        dataLists: dataListsWithItems,
        userGroups
    });
}
