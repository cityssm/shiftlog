import addLocation from '../../database/locations/addLocation.js';
import getLocations from '../../database/locations/getLocations.js';
export default async function handler(request, response) {
    const address1 = request.body.address1 || '';
    const address2 = request.body.address2 || '';
    const cityProvince = request.body.cityProvince || '';
    const latitude = request.body.latitude === '' ? undefined : Number(request.body.latitude);
    const longitude = request.body.longitude === '' ? undefined : Number(request.body.longitude);
    const success = await addLocation({ address1, address2, cityProvince, latitude, longitude }, request.session.user);
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
            message: 'Location could not be added.'
        });
    }
}
