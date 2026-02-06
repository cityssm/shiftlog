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
        dataLists = await getDataLists();
    }
    response.json({
        success,
        errorMessage: success ? undefined : 'Failed to update data list.',
        dataLists
    });
}
