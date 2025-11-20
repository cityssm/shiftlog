export default function updateEquipment(equipmentFields: {
    equipmentNumber: string;
    equipmentName: string;
    equipmentDescription: string;
    equipmentTypeDataListItemId: number;
    recordSync_isSynced?: boolean;
    userGroupId: number | undefined;
}, user: User): Promise<boolean>;
