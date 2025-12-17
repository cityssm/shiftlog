import addCrew from '../../database/crews/addCrew.js';
import getCrews from '../../database/crews/getCrews.js';
export default async function handler(request, response) {
    const crewId = await addCrew({
        crewName: request.body.crewName,
        userGroupId: request.body.userGroupId === ''
            ? undefined
            : Number.parseInt(request.body.userGroupId, 10)
    }, request.session.user);
    const crews = await getCrews();
    response.json({
        crewId,
        crews,
        success: crewId !== undefined
    });
}
