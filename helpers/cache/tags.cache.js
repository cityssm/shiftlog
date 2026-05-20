import getTagsFromDatabase from '../../database/tags/getTags.js';
let tags;
export async function getCachedTags() {
    tags ??= await getTagsFromDatabase();
    return tags;
}
export function clearTagsCache() {
    tags = undefined;
}
