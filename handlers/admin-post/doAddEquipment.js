import addEquipment from '../../database/equipment/addEquipment.js';
import getEquipmentList from '../../database/equipment/getEquipmentList.js';
export default async function handler(request, response) {
    const success = await addEquipment({
        equipmentNumber: request.body.equipmentNumber,
        equipmentName: request.body.equipmentName,
        equipmentDescription: request.body.equipmentDescription,
        equipmentTypeDataListItemId: Number.parseInt(request.body.equipmentTypeDataListItemId, 10),
        employeeListId: request.body.employeeListId === ''
            ? undefined
            : Number.parseInt(request.body.employeeListId, 10),
        userGroupId: request.body.userGroupId === ''
            ? undefined
            : Number.parseInt(request.body.userGroupId, 10)
    }, request.session.user);
    const equipment = await getEquipmentList();
    response.json({
        equipment,
        success
    });
}
