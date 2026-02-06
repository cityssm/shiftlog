export interface WorkOrderNoteField {
    noteTypeFieldId: number;
    fieldLabel: string;
    fieldInputType: string;
    fieldValue: string;
}
export interface WorkOrderNote {
    workOrderId: number;
    noteSequence: number;
    noteTypeId?: number | null;
    noteType?: string | null;
    noteText: string;
    fields?: WorkOrderNoteField[];
    recordCreate_dateTime: Date;
    recordCreate_userName: string;
    recordUpdate_dateTime: Date;
    recordUpdate_userName: string;
    recordDelete_dateTime?: Date | null;
    recordDelete_userName?: string | null;
}
export default function getWorkOrderNotes(workOrderId: number | string): Promise<WorkOrderNote[]>;
