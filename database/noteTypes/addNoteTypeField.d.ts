interface AddNoteTypeFieldForm {
    noteTypeId: number;
    fieldLabel: string;
    fieldInputType: 'text' | 'number' | 'date' | 'select' | 'textbox';
    fieldHelpText: string;
    dataListKey?: string | null;
    fieldValueMin?: number | null;
    fieldValueMax?: number | null;
    fieldValueRequired: boolean;
    hasDividerAbove: boolean;
}
export default function addNoteTypeField(fieldFields: AddNoteTypeFieldForm, user: User): Promise<boolean>;
export {};
