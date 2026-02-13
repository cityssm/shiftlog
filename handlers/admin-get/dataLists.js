import { getIconListByStyle } from '@cityssm/fontawesome-free-lists';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import getDataLists from '../../database/app/getDataLists.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(_request, response) {
    const dataLists = await getDataLists();
    const userGroups = await getUserGroups();
    const iconClasses = await getIconListByStyle('solid');
    // Get items for each data list
    const dataListsWithItems = await Promise.all(dataLists.map(async (dataList) => ({
        ...dataList,
        items: await getDataListItemsAdmin(dataList.dataListKey)
    })));
    response.render('admin/dataLists', {
        headTitle: 'Data List Management',
        section: 'admin',
        dataLists: dataListsWithItems,
        iconClasses,
        userGroups
    });
}
