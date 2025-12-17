export interface UpdateCrewForm {
    crewId: number;
    crewName: string;
    userGroupId?: number;
}
export default function updateCrew(crewForm: UpdateCrewForm, user: User): Promise<boolean>;
