import { dateToString } from '@cityssm/utils-datetime';
import getShifts from '../../database/shifts/getShifts.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const todayString = dateToString(new Date());
    const shiftsResult = getConfigProperty('shifts.isEnabled') &&
        request.session.user?.userProperties.shifts.canView
        ? await getShifts({ shiftDateString: todayString }, { limit: -1, offset: 0 }, request.session.user)
        : { shifts: [], totalCount: 0 };
    response.render('dashboard/dashboard', {
        headTitle: 'Dashboard',
        shifts: shiftsResult.shifts
    });
}
