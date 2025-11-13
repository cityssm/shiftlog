import getShiftTypeDataListItems from '../../database/shifts/getShiftTypeDataListItems.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const shiftTypes = await getShiftTypeDataListItems(request.session.user?.userName ?? '');
    response.render('shifts/edit', {
        headTitle: `Create New ${getConfigProperty('shifts.sectionNameSingular')}`,
        isCreate: true,
        shiftTypes
    });
}
