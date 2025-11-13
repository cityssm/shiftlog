import getDataListItems from '../../database/app/getDataListItems.js';
import getEquipment from '../../database/equipment/getEquipment.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(request, response) {
    const equipment = await getEquipment();
    const userGroups = await getUserGroups();
    const equipmentTypes = await getDataListItems('equipmentTypes', request.session.user.userName);
    response.render('admin/equipment', {
        headTitle: 'Equipment Maintenance',
        equipment,
        userGroups,
        equipmentTypes
    });
}
