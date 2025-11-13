import getEquipment from '../../database/equipment/getEquipment.js';
import updateEquipment from '../../database/equipment/updateEquipment.js';
export default async function handler(request, response) {
    const success = await updateEquipment(request.body.equipmentNumber, request.body.equipmentName, request.body.equipmentDescription, Number.parseInt(request.body.equipmentTypeDataListItemId, 10), request.body.userGroupId === ''
        ? undefined
        : Number.parseInt(request.body.userGroupId, 10), request.session.user);
    const equipment = await getEquipment();
    response.json({
        success,
        equipment
    });
}
