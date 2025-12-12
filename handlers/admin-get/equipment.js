import getDataListItems from '../../database/app/getDataListItems.js';
import getEquipmentList from '../../database/equipment/getEquipmentList.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(request, response) {
    const equipment = await getEquipmentList();
    const userGroups = await getUserGroups();
    const equipmentTypes = await getDataListItems('equipmentTypes', request.session.user?.userName);
    response.render('admin/equipment', {
        equipment,
        equipmentTypes,
        headTitle: 'Equipment Maintenance',
        userGroups
    });
}
