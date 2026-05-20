import type { Request, Response } from 'express'

import deleteTag from '../../database/tags/deleteTag.js'
import { getCachedTags } from '../../helpers/cache/tags.cache.js'
import type { Tag } from '../../types/record.types.js'

export type DoDeleteTagResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
      tags: Tag[]
    }

export default async function handler(
  request: Request,
  response: Response<DoDeleteTagResponse>
): Promise<void> {
  const tagName = (request.body.tagName as string) || ''

  const success = await deleteTag(tagName, request.session.user as User)

  if (success) {
    const tags = await getCachedTags()
    response.json({
      success: true,
      tags
    })
  } else {
    response.json({
      success: false,
      message: 'Tag could not be deleted.'
    })
  }
}
