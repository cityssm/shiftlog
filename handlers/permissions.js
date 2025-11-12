import { getConfigProperty } from '../helpers/config.helpers.js';
import { apiKeyIsValid, userIsAdmin } from '../helpers/user.helpers.js';
const urlPrefix = getConfigProperty('reverseProxy.urlPrefix');
const forbiddenStatus = 403;
const forbiddenJSON = {
    message: 'Forbidden',
    success: false
};
const forbiddenRedirectUrl = `${urlPrefix}/dashboard/?error=accessDenied`;
export function adminGetHandler(request, response, next) {
    if (userIsAdmin(request)) {
        next();
        return;
    }
    response.redirect(forbiddenRedirectUrl);
}
export function adminPostHandler(request, response, next) {
    if (userIsAdmin(request)) {
        next();
        return;
    }
    response.status(forbiddenStatus).json(forbiddenJSON);
}
export async function apiGetHandler(request, response, next) {
    if (await apiKeyIsValid(request)) {
        next();
    }
    else {
        response.redirect(`${urlPrefix}/login`);
    }
}
