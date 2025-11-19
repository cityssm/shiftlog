import type { Employee } from '../../types/record.types.js';
export default function addOrUpdateSyncedEmployee(partialEmployee: Partial<Employee>, syncUserName: string): Promise<boolean>;
