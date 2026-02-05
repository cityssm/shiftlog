import getLocationSuggestions from '../../database/locations/getLocationSuggestions.js';
export default async function handler(request, response) {
    const locations = await getLocationSuggestions(request.body.searchString);
    response.json({
        success: true,
        locations
    });
}
