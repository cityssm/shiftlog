import type { AdhocTask } from '../../types/record.types.js';
export default function getAvailableAdhocTasks(shiftId?: number | string): Promise<AdhocTask[]>;
