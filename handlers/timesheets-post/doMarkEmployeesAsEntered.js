import markEmployeesAsEntered from '../../database/timesheets/markEmployeesAsEntered.js';
export default async function handler(request, response) {
    const success = await markEmployeesAsEntered(request.body.timesheetId, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
