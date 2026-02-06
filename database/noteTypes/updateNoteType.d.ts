interface UpdateNoteTypeForm {
    isAvailableShifts: boolean;
    isAvailableTimesheets: boolean;
    isAvailableWorkOrders: boolean;
    noteType: string;
    noteTypeId: number;
    userGroupId?: number | null;
}
export default function updateNoteType(noteTypeFields: UpdateNoteTypeForm, user: User): Promise<boolean>;
export {};
