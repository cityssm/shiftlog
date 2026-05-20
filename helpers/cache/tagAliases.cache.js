import getTagAliasesFromDatabase from '../../database/tags/getTagAliases.js';
let tagAliases;
export async function getCachedTagAliases() {
    tagAliases ??= await getTagAliasesFromDatabase();
    return tagAliases;
}
export function clearTagAliasesCache() {
    tagAliases = undefined;
}
