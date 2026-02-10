export default function addEquipment(addEquipmentForm: {
    equipmentNumber: string;
    equipmentName: string;
    equipmentDescription: string;
    equipmentTypeDataListItemId: number;
    employeeListId: number | undefined;
    userGroupId: number | undefined;
}, user: User): Promise<boolean>;
