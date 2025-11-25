import getLocations from '../../database/locations/getLocations.js';
export default async function handler(request, response) {
    const locations = await getLocations();
    response.render('admin/locations', {
        headTitle: 'Location Maintenance',
        locations
    });
}
