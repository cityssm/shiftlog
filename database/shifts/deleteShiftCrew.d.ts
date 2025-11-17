interface DeleteShiftCrewForm {
    shiftId: number | string;
    crewId: number | string;
}
export default function deleteShiftCrew(form: DeleteShiftCrewForm): Promise<boolean>;
export {};
