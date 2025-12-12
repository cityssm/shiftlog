import { logApiRequest } from '../helpers/audit.helpers.js';
import { getUserNameFromApiKey } from '../helpers/cache/apiKeys.cache.js';
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
    const isValid = await apiKeyIsValid(request);
    const apiKey = request.params.apiKey;
    let userName;
    if (isValid && apiKey !== undefined) {
        userName = await getUserNameFromApiKey(apiKey);
    }
    // Log the API request
    await logApiRequest(request, isValid, userName);
    if (isValid) {
        next();
    }
    else {
        response.redirect(`${urlPrefix}/login`);
    }
}
