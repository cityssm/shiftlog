import getDataListItems from '../../database/app/getDataListItems.js';
export default async function handler(request, response) {
    const dataListKey = request.body.dataListKey;
    const userName = request.session.user?.userName;
    const items = await getDataListItems(dataListKey, userName);
    response.json({
        success: true,
        items
    });
}
