import type { WorkOrder } from '../../types/record.types.js';
export interface ShiftWorkOrder extends WorkOrder {
    shiftWorkOrderNote: string;
}
export default function getShiftWorkOrders(shiftId: number | string): Promise<ShiftWorkOrder[]>;
