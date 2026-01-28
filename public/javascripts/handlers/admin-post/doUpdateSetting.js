import updateSetting from '../../database/app/updateSetting.js';
export default async function handler(request, response) {
    const success = await updateSetting(request.body);
    response.json({
        success
    });
}
//# sourceMappingURL=doUpdateSetting.js.map