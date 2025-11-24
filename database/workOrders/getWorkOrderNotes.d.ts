export interface WorkOrderNote {
    workOrderId: number;
    noteSequence: number;
    noteText: string;
    recordCreate_userName: string;
    recordCreate_dateTime: Date;
    recordUpdate_userName: string;
    recordUpdate_dateTime: Date;
    recordDelete_userName?: string | null;
    recordDelete_dateTime?: Date | null;
}
export default function getWorkOrderNotes(workOrderId: number | string): Promise<WorkOrderNote[]>;
