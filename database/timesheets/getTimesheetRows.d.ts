import type { TimesheetRow } from '../../types/record.types.js';
export interface GetTimesheetRowsFilters {
    employeeNumberFilter?: string;
    equipmentNumberFilter?: string;
    onlyWithData?: boolean;
    onlyEmployees?: boolean;
    onlyEquipment?: boolean;
}
export default function getTimesheetRows(timesheetId: number | string, filters?: GetTimesheetRowsFilters): Promise<TimesheetRow[]>;
