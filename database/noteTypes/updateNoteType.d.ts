interface UpdateNoteTypeForm {
    noteTypeId: number;
    noteType: string;
    userGroupId?: number | null;
    isAvailableWorkOrders: boolean;
    isAvailableShifts: boolean;
    isAvailableTimesheets: boolean;
}
export default function updateNoteType(noteTypeFields: UpdateNoteTypeForm, user: User): Promise<boolean>;
export {};
