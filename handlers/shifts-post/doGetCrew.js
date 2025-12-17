import getCrew from '../../database/crews/getCrew.js';
export default async function handler(request, response) {
    const crew = await getCrew(Number.parseInt(request.body.crewId, 10));
    response.json({
        success: crew !== undefined,
        crew
    });
}
