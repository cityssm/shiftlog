import deleteDataList from '../../database/app/deleteDataList.js';
import getDataLists from '../../database/app/getDataLists.js';
export default async function handler(request, response) {
    const form = {
        ...request.body,
        userName: request.session.user?.userName ?? ''
    };
    const success = await deleteDataList(form);
    let dataLists;
    if (success) {
        dataLists = await getDataLists();
    }
    response.json({
        success,
        errorMessage: success ? undefined : 'Failed to delete data list.',
        dataLists
    });
}
