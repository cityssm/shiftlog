import getTagAliasesFromDatabase from '../../database/tags/getTagAliases.js'
import type { TagAlias } from '../../types/record.types.js'

let tagAliases: TagAlias[] | undefined

export async function getCachedTagAliases(): Promise<TagAlias[]> {
  // eslint-disable-next-line require-atomic-updates
  tagAliases ??= await getTagAliasesFromDatabase()
  return tagAliases
}

export function clearTagAliasesCache(): void {
  tagAliases = undefined
}
