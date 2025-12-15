import type { DateString } from '@cityssm/utils-datetime';
export interface AvailableEquipment {
    equipmentNumber: string;
    equipmentName: string;
}
export declare function getAvailableEquipment(shiftDateString: DateString): Promise<AvailableEquipment[]>;
export default getAvailableEquipment;
