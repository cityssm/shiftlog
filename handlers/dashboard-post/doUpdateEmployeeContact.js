import updateEmployeeContactByUserName from '../../database/employees/updateEmployeeContactByUserName.js';
export default async function handler(request, response) {
    const userName = request.session.user?.userName ?? '';
    const success = await updateEmployeeContactByUserName(userName, {
        phoneNumber: request.body.phoneNumber,
        phoneNumberAlternate: request.body.phoneNumberAlternate,
        emailAddress: request.body.emailAddress
    }, request.session.user);
    response.json({
        success
    });
}
