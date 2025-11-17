import type { ShiftEmployee } from '../../types/record.types.js';
export default function getShiftEmployees(shiftId: number | string, user?: User): Promise<ShiftEmployee[]>;
