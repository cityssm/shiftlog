import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    response.render('shifts/recovery', {
        headTitle: `${getConfigProperty('shifts.sectionName')} - Record Recovery`,
        error: request.query.error ?? ''
    });
}
