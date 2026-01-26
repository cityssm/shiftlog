import getCrew from '../../database/crews/getCrew.js';
export default async function handler(request, response) {
    const crew = await getCrew(Number.parseInt(request.body.crewId, 10));
    if (crew === undefined) {
        response.json({
            success: false
        });
        return;
    }
    response.json({
        success: true,
        crew: crew
    });
}
