import { dateToString } from '@cityssm/utils-datetime';
import getShifts from '../../database/shifts/getShifts.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const todayString = dateToString(new Date());
    const shifts = getConfigProperty('shifts.isEnabled') &&
        request.session.user?.userProperties.shifts.canView
        ? await getShifts({ shiftDateString: todayString }, request.session.user)
        : [];
    response.render('dashboard/dashboard', {
        headTitle: 'Dashboard',
        shifts
    });
}
