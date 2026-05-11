import { getConfigProperty } from '../../../helpers/config.helpers.js';
const msGraphEmailAddress = (getConfigProperty('connectors.msGraph')?.targetUser ?? '').toLowerCase();
const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
export function isEmailAddress(value) {
    return emailRegex.test(value);
}
export function getSubscriberEmailAddresses(message) {
    const emailAddresses = [];
    for (const recipient of message.toRecipients ?? []) {
        if (!emailAddresses.includes(recipient.emailAddress.address) &&
            recipient.emailAddress.address.toLowerCase() !== msGraphEmailAddress) {
            emailAddresses.push(recipient.emailAddress.address);
        }
    }
    for (const recipient of message.ccRecipients ?? []) {
        if (!emailAddresses.includes(recipient.emailAddress.address) &&
            recipient.emailAddress.address.toLowerCase() !== msGraphEmailAddress) {
            emailAddresses.push(recipient.emailAddress.address);
        }
    }
    return emailAddresses;
}
export function isNoReplyEmailAddress(emailAddress, name = '') {
    const lowercaseEmail = emailAddress.toLowerCase();
    const lowercaseName = name.toLowerCase();
    return ((isEmailAddress(lowercaseEmail) &&
        (lowercaseEmail.includes('noreply') ||
            lowercaseEmail.includes('no-reply'))) ||
        lowercaseName.includes('noreply') ||
        lowercaseName.includes('no-reply') ||
        lowercaseName.includes('do not reply') ||
        lowercaseName.includes('donotreply'));
}
