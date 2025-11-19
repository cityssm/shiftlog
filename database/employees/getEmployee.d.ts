import type { Employee } from '../../types/record.types.js';
export default function getEmployee(employeeNumber: string, includeDeleted?: boolean): Promise<Employee | undefined>;
