export interface WorkOrderNote {
    workOrderId: number;
    noteSequence: number;
    noteText: string;
    recordCreate_dateTime: Date;
    recordCreate_userName: string;
    recordUpdate_dateTime: Date;
    recordUpdate_userName: string;
    recordDelete_dateTime?: Date | null;
    recordDelete_userName?: string | null;
}
export default function getWorkOrderNotes(workOrderId: number | string): Promise<WorkOrderNote[]>;
