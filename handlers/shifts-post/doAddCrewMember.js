import addCrewMember from '../../database/crews/addCrewMember.js';
import getCrew from '../../database/crews/getCrew.js';
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
    const success = await addCrewMember(crewId, request.body.employeeNumber);
    const updatedCrew = await getCrew(crewId);
    response.json({
        success,
        crew: updatedCrew
    });
}
