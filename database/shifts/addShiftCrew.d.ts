interface AddShiftCrewForm {
    shiftId: number | string;
    crewId: number | string;
    shiftCrewNote?: string;
}
export default function addShiftCrew(form: AddShiftCrewForm, user: User): Promise<boolean>;
export {};
