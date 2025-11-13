import deleteEmployee from '../../database/employees/deleteEmployee.js';
import getEmployees from '../../database/employees/getEmployees.js';
export default async function handler(request, response) {
    try {
        const success = await deleteEmployee(request.body.employeeNumber, request.session.user);
        if (success) {
            const employees = await getEmployees();
            response.json({
                employees,
                message: 'Employee deleted successfully',
                success: true
            });
        }
        else {
            response.status(404).json({
                message: 'Employee not found or already deleted',
                success: false
            });
        }
    }
    catch (error) {
        response.status(500).json({
            message: error instanceof Error ? error.message : 'Failed to delete employee',
            success: false
        });
    }
}
