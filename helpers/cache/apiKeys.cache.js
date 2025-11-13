// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection */
import getApiKeys from '../../database/users/getApiKeys.js';
let apiKeys = {};
export async function getCachedApiKeys() {
    if (Object.keys(apiKeys).length === 0) {
        apiKeys = await getApiKeys();
    }
    return apiKeys;
}
export async function getApiKeyByUserName(userName) {
    const cachedKeys = await getCachedApiKeys();
    return cachedKeys[userName];
}
export async function getUserNameFromApiKey(apiKey) {
    const cachedKeys = await getCachedApiKeys();
    return Object.keys(cachedKeys).find((userName) => cachedKeys[userName] === apiKey);
}
export function clearApiKeysCache() {
    apiKeys = {};
}
