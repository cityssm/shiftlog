import updateEmployee from '../../database/employees/updateEmployee.js';
export default async function handler(request, response) {
    const { employeeNumber, firstName, lastName, userName, isSupervisor = '0', phoneNumber, phoneNumberAlternate, emailAddress, userGroupId } = request.body;
    try {
        const success = await updateEmployee({
            employeeNumber,
            firstName,
            lastName,
            userName: userName === '' ? null : userName,
            isSupervisor: isSupervisor === '1',
            phoneNumber: phoneNumber === '' ? null : phoneNumber,
            phoneNumberAlternate: phoneNumberAlternate === '' ? null : phoneNumberAlternate,
            emailAddress: emailAddress === '' ? null : emailAddress,
            userGroupId: userGroupId === undefined || userGroupId === ''
                ? null
                : Number.parseInt(userGroupId, 10)
        }, request.session.user);
        if (success) {
            response.json({
                message: 'Employee updated successfully',
                success: true
            });
        }
        else {
            response.status(404).json({
                message: 'Employee not found',
                success: false
            });
        }
    }
    catch (error) {
        response.status(500).json({
            message: error instanceof Error ? error.message : 'Failed to update employee',
            success: false
        });
    }
}
