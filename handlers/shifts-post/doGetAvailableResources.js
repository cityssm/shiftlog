import { getAvailableCrews } from '../../database/shifts/getAvailableCrews.js';
import { getAvailableEmployees } from '../../database/shifts/getAvailableEmployees.js';
import { getAvailableEquipment } from '../../database/shifts/getAvailableEquipment.js';
export default async function handler(request, response) {
    const { shiftDateString } = request.body;
    const [employees, equipment, crews] = await Promise.all([
        getAvailableEmployees(shiftDateString),
        getAvailableEquipment(shiftDateString),
        getAvailableCrews(shiftDateString)
    ]);
    response.json({
        crews,
        employees,
        equipment,
        success: true
    });
}
