import { getCachedTags } from './cache/tags.cache.js';
export async function getTagsInText(text) {
    const textLowerCase = text.toLowerCase();
    const tags = await getCachedTags();
    const foundTags = [];
    for (const tag of tags) {
        if (textLowerCase.includes(tag.tagName.toLowerCase())) {
            foundTags.push(tag.tagName);
        }
    }
    return foundTags;
}
