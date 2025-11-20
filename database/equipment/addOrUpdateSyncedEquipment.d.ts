import type { Equipment } from '../../types/record.types.js';
export default function addOrUpdateSyncedEquipment(partialEquipment: Partial<Equipment>, syncUserName: string): Promise<boolean>;
