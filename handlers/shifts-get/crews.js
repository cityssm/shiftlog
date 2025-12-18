import getCrews from '../../database/crews/getCrews.js';
import getEmployees from '../../database/employees/getEmployees.js';
import getEquipmentList from '../../database/equipment/getEquipmentList.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(request, response) {
    const crews = await getCrews();
    const employees = await getEmployees();
    const equipment = await getEquipmentList();
    const userGroups = await getUserGroups();
    response.render('shifts/crews', {
        crews,
        employees,
        equipment,
        headTitle: 'Crew Maintenance',
        userGroups
    });
}
