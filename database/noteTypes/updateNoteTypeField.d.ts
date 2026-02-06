interface UpdateNoteTypeFieldForm {
    noteTypeFieldId: number;
    fieldLabel: string;
    fieldInputType: 'text' | 'number' | 'date' | 'select' | 'textbox';
    fieldHelpText: string;
    dataListKey?: string | null;
    fieldValueMin?: number | null;
    fieldValueMax?: number | null;
    fieldValueRequired: boolean;
    hasDividerAbove: boolean;
}
export default function updateNoteTypeField(fieldFields: UpdateNoteTypeFieldForm, user: User): Promise<boolean>;
export {};
