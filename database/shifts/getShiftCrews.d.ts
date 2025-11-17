import type { ShiftCrew } from '../../types/record.types.js';
export default function getShiftCrews(shiftId: number | string, user?: User): Promise<ShiftCrew[]>;
