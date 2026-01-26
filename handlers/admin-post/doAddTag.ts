import type { Request, Response } from 'express'

import addTag from '../../database/tags/addTag.js'
import getTags from '../../database/tags/getTags.js'
import type { Tag } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddTagResponse =
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
  response: Response<DoAddTagResponse>
): Promise<void> {
  const tagName = (request.body.tagName as string) || ''
  let tagBackgroundColor =
    (request.body.tagBackgroundColor as string) || '000000'
  let tagTextColor = (request.body.tagTextColor as string) || 'FFFFFF'

  // Remove # prefix if present
  if (tagBackgroundColor.startsWith('#')) {
    tagBackgroundColor = tagBackgroundColor.slice(1)
  }
  if (tagTextColor.startsWith('#')) {
    tagTextColor = tagTextColor.slice(1)
  }

  const success = await addTag(
    { tagName, tagBackgroundColor, tagTextColor },
    request.session.user as User
  )

  if (success) {
    const tags = await getTags()

    response.json({
      success: true,
      tags
    })
  } else {
    response.json({
      success: false,
      message: 'Tag could not be added. Tag name may already exist.'
    })
  }
}
