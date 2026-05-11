import getDataListItems from '../../database/app/getDataListItems.js';
import getEmployees from '../../database/employees/getEmployees.js';
import getEquipmentList from '../../database/equipment/getEquipmentList.js';
export default async function handler(request, response) {
    const [employees, equipment, jobClassifications, timeCodes] = await Promise.all([
        getEmployees(),
        getEquipmentList(),
        getDataListItems('jobClassifications', request.session.user?.userName),
        getDataListItems('timeCodes', request.session.user?.userName)
    ]);
    response.json({
        success: true,
        employees: employees.map((employeeItem) => ({
            employeeNumber: employeeItem.employeeNumber,
            firstName: employeeItem.firstName,
            lastName: employeeItem.lastName
        })),
        equipment: equipment.map((equipmentItem) => ({
            equipmentNumber: equipmentItem.equipmentNumber,
            equipmentName: equipmentItem.equipmentName
        })),
        jobClassifications: jobClassifications.map((jobClassificationItem) => ({
            dataListItemId: jobClassificationItem.dataListItemId,
            dataListItem: jobClassificationItem.dataListItem
        })),
        timeCodes: timeCodes.map((timeCodeItem) => ({
            dataListItemId: timeCodeItem.dataListItemId,
            dataListItem: timeCodeItem.dataListItem
        }))
    });
}
