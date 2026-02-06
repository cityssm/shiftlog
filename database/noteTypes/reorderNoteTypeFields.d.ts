export interface ReorderNoteTypeFieldsForm {
    noteTypeId: number;
    noteTypeFieldIds: number[];
    userName: string;
}
export default function reorderNoteTypeFields(form: ReorderNoteTypeFieldsForm): Promise<boolean>;
