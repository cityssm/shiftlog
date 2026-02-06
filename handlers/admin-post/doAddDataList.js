import createDataList from '../../database/app/createDataList.js';
import getDataLists from '../../database/app/getDataLists.js';
export default async function handler(request, response) {
    // Validate that the dataListKey starts with "user-"
    if (!request.body.dataListKey.startsWith('user-')) {
        response.json({
            success: false,
            errorMessage: 'Non-system data list keys must start with "user-" prefix.'
        });
        return;
    }
    const form = {
        ...request.body,
        isSystemList: false,
        userName: request.session.user?.userName ?? ''
    };
    const success = await createDataList(form, form.userName);
    let dataLists;
    if (success) {
        dataLists = await getDataLists();
    }
    response.json({
        success,
        errorMessage: success ? undefined : 'Failed to create data list.',
        dataLists
    });
}
