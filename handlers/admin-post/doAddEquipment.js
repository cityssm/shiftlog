import addEquipment from '../../database/equipment/addEquipment.js';
import getEquipmentList from '../../database/equipment/getEquipmentList.js';
export default async function handler(request, response) {
    const success = await addEquipment(request.body.equipmentNumber, request.body.equipmentName, request.body.equipmentDescription, Number.parseInt(request.body.equipmentTypeDataListItemId, 10), request.body.employeeListId === ''
        ? undefined
        : Number.parseInt(request.body.employeeListId, 10), request.body.userGroupId === ''
        ? undefined
        : Number.parseInt(request.body.userGroupId, 10), request.session.user);
    const equipment = await getEquipmentList();
    response.json({
        equipment,
        success
    });
}
