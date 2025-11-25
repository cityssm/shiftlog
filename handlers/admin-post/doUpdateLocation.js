import getLocations from '../../database/locations/getLocations.js';
import updateLocation from '../../database/locations/updateLocation.js';
export default async function handler(request, response) {
    const locationId = Number(request.body.locationId);
    const locationName = request.body.locationName;
    const address1 = request.body.address1 || '';
    const address2 = request.body.address2 || '';
    const cityProvince = request.body.cityProvince || '';
    const latitude = request.body.latitude !== '' ? Number(request.body.latitude) : null;
    const longitude = request.body.longitude !== '' ? Number(request.body.longitude) : null;
    const success = await updateLocation(locationId, locationName, address1, address2, cityProvince, latitude, longitude, request.session.user);
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
            message: 'Location could not be updated.'
        });
    }
}
