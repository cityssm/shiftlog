import type { Shift } from '../../types/record.types.js';
export default function getShift(shiftId: number | string, user?: User): Promise<Shift | undefined>;
