import getEmployees from '../../database/employees/getEmployees.js';
import { getEligibleEmployeesForEquipment } from '../../helpers/equipment.helpers.js';
export default async function handler(request, response) {
    const equipmentNumber = request.body.equipmentNumber;
    if (!equipmentNumber) {
        response.status(400).json({
            success: false,
            message: 'Equipment number is required.'
        });
        return;
    }
    const allEmployees = await getEmployees();
    const eligibleEmployees = await getEligibleEmployeesForEquipment(equipmentNumber, allEmployees);
    response.json({
        success: true,
        employees: eligibleEmployees
    });
}
