import { getCachedSettingValue } from '../../../helpers/cache/settings.cache.js';
async function _fromEmailAddressIsAllowed(fromAddressLowerCase, fromDomainLowerCase) {
    const allowedFromDomainsString = await getCachedSettingValue('msGraph.from.allowedDomains');
    const allowedFromDomains = allowedFromDomainsString
        .split(',')
        .map((domain) => domain.trim().toLowerCase())
        .filter((domain) => domain !== '');
    const allowedEmailAddressesString = await getCachedSettingValue('msGraph.from.allowedEmailAddresses');
    const allowedEmailAddresses = allowedEmailAddressesString
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email !== '');
    return ((allowedFromDomains.length === 0 && allowedEmailAddresses.length === 0) ||
        allowedEmailAddresses.includes(fromAddressLowerCase) ||
        allowedFromDomains.includes(fromDomainLowerCase));
}
async function _fromEmailAddressIsBlocked(fromAddressLowerCase, fromDomainLowerCase) {
    const blockedFromDomainsString = await getCachedSettingValue('msGraph.from.blockedDomains');
    const blockedFromDomains = blockedFromDomainsString
        .split(',')
        .map((domain) => domain.trim().toLowerCase())
        .filter((domain) => domain !== '');
    const blockedEmailAddressesString = await getCachedSettingValue('msGraph.from.blockedEmailAddresses');
    const blockedEmailAddresses = blockedEmailAddressesString
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email !== '');
    return (blockedEmailAddresses.includes(fromAddressLowerCase) ||
        blockedFromDomains.includes(fromDomainLowerCase));
}
export async function fromEmailAddressIsAllowed(fromAddress) {
    const fromAddressLowerCase = fromAddress.toLowerCase();
    const fromDomain = fromAddressLowerCase.split('@')[1] ?? '';
    return ((await _fromEmailAddressIsAllowed(fromAddressLowerCase, fromDomain)) &&
        !(await _fromEmailAddressIsBlocked(fromAddressLowerCase, fromDomain)));
}
