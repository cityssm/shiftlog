import type { DateString } from '@cityssm/utils-datetime';
export interface AvailableEquipment {
    equipmentNumber: string;
    equipmentName: string;
}
export default function getAvailableEquipment(shiftDateString: DateString): Promise<AvailableEquipment[]>;
