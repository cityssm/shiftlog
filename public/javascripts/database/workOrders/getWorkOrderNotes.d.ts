export interface WorkOrderNoteField {
    fieldInputType: string;
    fieldLabel: string;
    fieldValue: string;
    noteTypeFieldId: number;
}
export interface WorkOrderNote {
    fields?: WorkOrderNoteField[];
    noteSequence: number;
    noteText: string;
    noteType?: string | null;
    noteTypeId?: number | null;
    recordCreate_dateTime: Date;
    recordCreate_userName: string;
    recordDelete_dateTime?: Date | null;
    recordDelete_userName?: string | null;
    recordUpdate_dateTime: Date;
    recordUpdate_userName: string;
    workOrderId: number;
}
export default function getWorkOrderNotes(workOrderId: number | string): Promise<WorkOrderNote[]>;
