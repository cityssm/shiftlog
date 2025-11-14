import type { Employee } from '../../types/record.types.js';
interface GetEmployeesFilters {
    isSupervisor?: boolean;
}
export default function getEmployees(filters?: GetEmployeesFilters): Promise<Employee[]>;
export {};
