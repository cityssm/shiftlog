import type { Location } from '../../types/record.types.js';
export default function addOrUpdateSyncedLocation(partialLocation: Partial<Location>, syncUserName: string): Promise<boolean>;
