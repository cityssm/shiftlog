import type { Equipment } from '../../types/record.types.js';
interface GetEquipmentListFilters {
    equipmentNumber?: string;
    includeDeleted?: boolean;
}
export default function getEquipmentList(filters?: GetEquipmentListFilters): Promise<Equipment[]>;
export {};
