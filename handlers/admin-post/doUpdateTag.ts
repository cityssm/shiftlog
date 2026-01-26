import type { Request, Response } from 'express'

import getTags from '../../database/tags/getTags.js'
import updateTag from '../../database/tags/updateTag.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateTagResponse =
  | {
      success: true
      tags: Awaited<ReturnType<typeof getTags>>
    }
  | {
      success: false
      message: string
    }

export default async function handler(
  request: Request,
  response: Response<DoUpdateTagResponse>
): Promise<void> {
  const tagName = (request.body.tagName as string) || ''
  let tagBackgroundColor = (request.body.tagBackgroundColor as string) || '000000'
  let tagTextColor = (request.body.tagTextColor as string) || 'FFFFFF'

  // Remove # prefix if present
  if (tagBackgroundColor.startsWith('#')) {
    tagBackgroundColor = tagBackgroundColor.substring(1)
  }
  if (tagTextColor.startsWith('#')) {
    tagTextColor = tagTextColor.substring(1)
  }

  const success = await updateTag(
    { tagName, tagBackgroundColor, tagTextColor },
    request.session.user as User
  )

  if (success) {
    const tags = await getTags()
    response.json({
      success: true,
      tags
    } satisfies DoUpdateTagResponse)
  } else {
    response.json({
      success: false,
      message: 'Tag could not be updated.'
    } satisfies DoUpdateTagResponse)
  }
}
