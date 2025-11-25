import deleteLocation from '../../database/locations/deleteLocation.js';
import getLocations from '../../database/locations/getLocations.js';
export default async function handler(request, response) {
    const locationId = Number(request.body.locationId);
    const success = await deleteLocation(locationId, request.session.user);
    if (success) {
        const locations = await getLocations();
        response.json({
            success: true,
            locations
        });
    }
    else {
        response.json({
            success: false,
            message: 'Location could not be deleted.'
        });
    }
}
