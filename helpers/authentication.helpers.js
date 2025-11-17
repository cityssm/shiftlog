import { ActiveDirectoryAuthenticator, ADWebAuthAuthenticator, FunctionAuthenticator, PlainTextAuthenticator } from '@cityssm/authentication-helper';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:helpers:authentication`);
let authenticator;
const authenticationConfig = getConfigProperty('login.authentication');
const domain = getConfigProperty('login.domain');
if (authenticationConfig === undefined) {
    debug('`login.authentication` not defined.');
}
else {
    switch (authenticationConfig.type) {
        case 'activeDirectory': {
            authenticator = new ActiveDirectoryAuthenticator(authenticationConfig.config);
            break;
        }
        case 'adWebAuth': {
            authenticator = new ADWebAuthAuthenticator(authenticationConfig.config);
            break;
        }
        case 'function': {
            authenticator = new FunctionAuthenticator(authenticationConfig.config);
            break;
        }
        case 'plainText': {
            debug('WARNING: Using plain text authentication.');
            authenticator = new PlainTextAuthenticator(authenticationConfig.config);
            break;
        }
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default: {
            debug("Unknown 'login.authentication' type");
        }
    }
}
export async function authenticate(userName, passwordPlain) {
    if (userName === '' || passwordPlain === '') {
        return false;
    }
    let isAuthenticated = false;
    console.log('authenticator:', authenticator);
    if (authenticator !== undefined) {
        isAuthenticated = await authenticator.authenticate(`${domain}\\${userName}`, passwordPlain);
    }
    return isAuthenticated;
}
/* eslint-disable @cspell/spellchecker */
const safeRedirects = new Set([
    '/admin/settings',
    '/admin/users',
    '/dashboard',
    '/dashboard/usersettings'
]);
/* eslint-enable @cspell/spellchecker */
export function getSafeRedirectUrl(possibleRedirectUrl = '') {
    const urlPrefix = getConfigProperty('reverseProxy.urlPrefix');
    if (typeof possibleRedirectUrl === 'string') {
        const urlToCheck = possibleRedirectUrl.startsWith(urlPrefix)
            ? possibleRedirectUrl.slice(urlPrefix.length)
            : possibleRedirectUrl;
        const urlToCheckLowerCase = urlToCheck.toLowerCase();
        if (safeRedirects.has(urlToCheckLowerCase)) {
            return urlPrefix + urlToCheck;
        }
    }
    return `${urlPrefix}/dashboard/`;
}
