interface AddNoteTypeForm {
    isAvailableShifts: boolean;
    isAvailableTimesheets: boolean;
    isAvailableWorkOrders: boolean;
    noteType: string;
    userGroupId?: number | null;
}
export default function addNoteType(noteTypeFields: AddNoteTypeForm, user: User): Promise<boolean>;
export {};
