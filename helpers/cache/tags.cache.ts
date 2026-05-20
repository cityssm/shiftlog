import getTagsFromDatabase from '../../database/tags/getTags.js'
import type { Tag } from '../../types/record.types.js'

let tags: Tag[] | undefined

export async function getCachedTags(): Promise<Tag[]> {
  // eslint-disable-next-line require-atomic-updates
  tags ??= await getTagsFromDatabase()
  return tags
}

export function clearTagsCache(): void {
  tags = undefined
}
