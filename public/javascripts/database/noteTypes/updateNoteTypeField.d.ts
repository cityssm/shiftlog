interface UpdateNoteTypeFieldForm {
    dataListKey?: string | null;
    fieldHelpText: string;
    fieldInputType: 'date' | 'number' | 'select' | 'text' | 'textbox';
    fieldLabel: string;
    fieldUnitPrefix: string;
    fieldUnitSuffix: string;
    fieldValueMax?: number | null;
    fieldValueMin?: number | null;
    fieldValueRequired: boolean;
    hasDividerAbove: boolean;
    noteTypeFieldId: number;
}
export default function updateNoteTypeField(fieldFields: UpdateNoteTypeFieldForm, user: User): Promise<boolean>;
export {};
