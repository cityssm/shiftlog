import type { ShiftEquipment } from '../../types/record.types.js';
export default function getShiftEquipment(shiftId: number | string, user?: User): Promise<ShiftEquipment[]>;
