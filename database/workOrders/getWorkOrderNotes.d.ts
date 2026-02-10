export interface WorkOrderNoteField {
    dataListKey?: string | null;
    fieldHelpText?: string;
    fieldInputType: string;
    fieldLabel: string;
    fieldUnitPrefix?: string;
    fieldUnitSuffix?: string;
    fieldValue: string;
    fieldValueMax?: number | null;
    fieldValueMin?: number | null;
    fieldValueRequired?: boolean;
    hasDividerAbove?: boolean;
    noteTypeFieldId: number;
    orderNumber?: number | null;
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
