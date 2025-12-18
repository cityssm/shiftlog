export interface AddCrewForm {
    crewName: string;
    userGroupId?: number;
}
export default function addCrew(crewForm: AddCrewForm, user: User): Promise<number | undefined>;
