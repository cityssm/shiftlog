import deleteEquipment from '../../database/equipment/deleteEquipment.js';
import getEquipment from '../../database/equipment/getEquipment.js';
export default async function handler(request, response) {
    const success = await deleteEquipment(request.body.equipmentNumber, request.session.user);
    const equipment = await getEquipment();
    response.json({
        equipment,
        success
    });
}
