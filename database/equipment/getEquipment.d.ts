import type { Equipment } from '../../types/record.types.js';
export default function getEquipment(equipmentNumber: string, includeDeleted?: boolean): Promise<Equipment | undefined>;
