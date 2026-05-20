import { getCachedTagAliases } from './cache/tagAliases.cache.js';
import { getCachedTags } from './cache/tags.cache.js';
export async function getTagsInText(text) {
    const textLowerCase = text.toLowerCase();
    const foundTags = new Set();
    const tags = await getCachedTags();
    for (const tag of tags) {
        if (textLowerCase.includes(tag.tagName.toLowerCase())) {
            foundTags.add(tag.tagName);
        }
    }
    const tagAliases = await getCachedTagAliases();
    for (const tagAlias of tagAliases) {
        if (textLowerCase.includes(tagAlias.tagNameAlias.toLowerCase())) {
            foundTags.add(tagAlias.tagName);
        }
    }
    return [...foundTags];
}
