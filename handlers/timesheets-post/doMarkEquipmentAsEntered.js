import markEquipmentAsEntered from '../../database/timesheets/markEquipmentAsEntered.js';
export default async function handler(request, response) {
    const success = await markEquipmentAsEntered(request.body.timesheetId, request.session.user?.userName ?? '');
    response.json({
        success
    });
}
