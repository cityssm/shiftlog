import addShiftEquipment from '../../database/shifts/addShiftEquipment.js';
import { validateEmployeeForEquipment } from '../../helpers/equipment.helpers.js';
export default async function handler(request, response) {
    // Validate employee is allowed for this equipment
    const validation = await validateEmployeeForEquipment(request.body.equipmentNumber, request.body.employeeNumber);
    if (!validation.success) {
        response.status(400).json({
            success: false,
            message: validation.errorMessage
        });
        return;
    }
    const success = await addShiftEquipment(request.body);
    response.json({
        success
    });
}
