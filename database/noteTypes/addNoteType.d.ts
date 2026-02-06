interface AddNoteTypeForm {
    noteType: string;
    userGroupId?: number | null;
    isAvailableWorkOrders: boolean;
    isAvailableShifts: boolean;
    isAvailableTimesheets: boolean;
}
export default function addNoteType(noteTypeFields: AddNoteTypeForm, user: User): Promise<boolean>;
export {};
