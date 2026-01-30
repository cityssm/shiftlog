import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    response.render('shifts/builder', {
        headTitle: `${getConfigProperty('shifts.sectionNameSingular')} Builder`,
        section: 'shifts',
        error: request.query.error ?? ''
    });
}
