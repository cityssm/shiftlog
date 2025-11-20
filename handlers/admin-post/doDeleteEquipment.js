import deleteEquipment from '../../database/equipment/deleteEquipment.js';
import getEquipmentList from '../../database/equipment/getEquipmentList.js';
export default async function handler(request, response) {
    const success = await deleteEquipment(request.body.equipmentNumber, request.session.user);
    const equipment = await getEquipmentList();
    response.json({
        equipment,
        success
    });
}
