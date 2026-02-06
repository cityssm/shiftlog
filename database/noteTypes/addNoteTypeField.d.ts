interface AddNoteTypeFieldForm {
    dataListKey?: string | null;
    fieldHelpText: string;
    fieldInputType: 'date' | 'number' | 'select' | 'text' | 'textbox';
    fieldLabel: string;
    fieldValueMax?: number | null;
    fieldValueMin?: number | null;
    fieldValueRequired: boolean;
    hasDividerAbove: boolean;
    noteTypeId: number;
}
export default function addNoteTypeField(fieldFields: AddNoteTypeFieldForm, user: User): Promise<boolean>;
export {};
