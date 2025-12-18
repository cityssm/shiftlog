import addCrewEquipment from '../../database/crews/addCrewEquipment.js';
import getCrew from '../../database/crews/getCrew.js';
import { validateEmployeeForEquipment } from '../../helpers/equipment.helpers.js';
export default async function handler(request, response) {
    const user = request.session.user;
    const crewId = Number.parseInt(request.body.crewId, 10);
    // Check permissions
    const crew = await getCrew(crewId);
    if (crew === undefined) {
        response.status(404).json({
            success: false,
            message: 'Crew not found.'
        });
        return;
    }
    if (!user.userProperties.shifts.canManage &&
        crew.recordCreate_userName !== user.userName) {
        response.status(403).json({
            success: false,
            message: 'You do not have permission to modify this crew.'
        });
        return;
    }
    const employeeNumber = request.body.employeeNumber === '' ? undefined : request.body.employeeNumber;
    // Validate employee is allowed for this equipment
    const validation = await validateEmployeeForEquipment(request.body.equipmentNumber, employeeNumber);
    if (!validation.success) {
        response.status(400).json({
            success: false,
            message: validation.errorMessage
        });
        return;
    }
    const success = await addCrewEquipment(crewId, request.body.equipmentNumber, employeeNumber);
    const updatedCrew = await getCrew(crewId);
    response.json({
        success,
        crew: updatedCrew
    });
}
