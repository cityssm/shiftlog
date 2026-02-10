export interface ShiftNoteField {
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
export interface ShiftNote {
    fields?: ShiftNoteField[];
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
    shiftId: number;
}
export default function getShiftNotes(shiftId: number | string): Promise<ShiftNote[]>;
