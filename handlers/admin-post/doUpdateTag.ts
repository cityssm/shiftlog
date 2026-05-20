import type { Request, Response } from 'express'

import updateTag from '../../database/tags/updateTag.js'
import { getCachedTags } from '../../helpers/cache/tags.cache.js'
import type { Tag } from '../../types/record.types.js'

export type DoUpdateTagResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
      tags: Tag[]
    }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { tagName?: string; tagBackgroundColor?: string; tagTextColor?: string }
  >,
  response: Response<DoUpdateTagResponse>
): Promise<void> {
  const tagName = request.body.tagName ?? ''

  let tagBackgroundColor = request.body.tagBackgroundColor ?? '000000'

  let tagTextColor = request.body.tagTextColor ?? 'FFFFFF'

  // Remove # prefix if present
  if (tagBackgroundColor.startsWith('#')) {
    tagBackgroundColor = tagBackgroundColor.slice(1)
  }
  if (tagTextColor.startsWith('#')) {
    tagTextColor = tagTextColor.slice(1)
  }

  const success = await updateTag(
    { tagName, tagBackgroundColor, tagTextColor },
    request.session.user as User
  )

  if (success) {
    const tags = await getCachedTags()
    response.json({
      success: true,
      tags
    })
  } else {
    response.json({
      success: false,
      message: 'Tag could not be updated.'
    })
  }
}
